// Guard test (Task 8): scans app/ and components/ (all .tsx files,
// recursively) for hardcoded user-facing strings, so a future change cannot
// silently reintroduce English into a screen this plan already localized.
//
// Parses each file with the TypeScript compiler API (not regex) and flags:
//
//   1. String/template literals passed to the 8 text-rendering JSX props
//      that render on screen: title=, label=, placeholder=, body=,
//      accessibilityLabel=, accessibilityHint=, actionLabel=, subtitle=.
//      This INCLUDES template-literal props, e.g.
//      `label={\`${PREMIUM_DISPLAY.yearlyLabel} · ${price}\`}` — the exact
//      failure class that shipped "Premium · yearly · 29,99 €" in every
//      locale, because the manual sweep's grep set (Alert.alert,
//      placeholder=, accessibilityLabel/Hint, JSX text nodes, Stack.Screen
//      title) never looked at template-literal label=/title= props at all.
//   2. Bare text children of <Text> and <Animated.Text>.
//   3. Alert.alert(...) string-literal arguments — the title, the message,
//      and each button's `text:` entry. The other failure class this plan
//      actually hit (several Alert bodies were found untranslated across
//      the plan).
//   4. Stack.Screen / Tabs.Screen `options={{ title, tabBarAccessibilityLabel }}`.
//      Not one of the 8 props above — the string sits inside a NESTED
//      object literal, not a JSX attribute — but Task 7 found exactly this
//      shape hardcoded (a local Stack.Screen title silently overriding an
//      already-translated app/_layout.tsx one), so it gets its own narrow
//      rule rather than being left to the generic prop scan to miss again.
//      `options=` is used ONLY for react-navigation route config in this
//      codebase (every `options={{` call site is a Stack.Screen or
//      Tabs.Screen — verified by hand when this test was written), so
//      keying off the attribute name alone is safe here.
//
// A literal is only flagged if it contains at least one Unicode letter —
// this single heuristic is most of what keeps the false-positive rate low.
// It quietly and correctly clears, with no allowlist entry needed:
//   - separators/punctuation/ellipsis-only branches (' · ', '…')
//   - emoji-only branches ('✅' / '⬜️')
//   - catalog KEYS — `t(\`domain.light.${x}\`)` is a CallExpression sitting
//     in the prop slot, not a literal directly in it, so the rules above
//     never even look at the template literal one level down inside the
//     call's arguments
//   - style / testID / accessibilityRole / accessibilityState values — not
//     in the scanned prop list
//   - icon `name=` props — ditto
//   - date-fns format strings (`format(date, 'MMM d')`) — not a JSX prop or
//     an Alert.alert argument at all, so never visited
//   - the legal SECTIONS body arrays (app/legal/privacy.tsx, terms.tsx) —
//     those are object-literal `title:`/`body:` PROPERTIES (`key: value`),
//     not JSX `title=`/`body=` ATTRIBUTES, so rule 1 structurally never
//     matches them
//   - CareLog.note writes, lib/family.ts's share text, lib/aiSafety.ts's /
//     lib/openrouter.ts's AI alert bodies — all live under lib/, outside
//     this test's app/ + components/ .tsx scan scope by design (see the
//     "Deliberately untranslated" section of progress.md)
//
// What's left after that filter is a small, curated ALLOWLIST below for the
// genuinely-intentional English strings the scan still turns up (a brand
// name, a Latin binomial, and decorative onboarding mock content) — each
// with a comment explaining why. Anything else the scan finds is a bug: fix
// it by adding a catalog key (all four languages) and calling `t()`.
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const TARGET_PROPS = new Set([
  'title',
  'label',
  'placeholder',
  'body',
  'accessibilityLabel',
  'accessibilityHint',
  'actionLabel',
  'subtitle',
]);

const NAV_OPTION_PROPS = new Set(['title', 'tabBarAccessibilityLabel']);

interface Finding {
  file: string; // repo-relative, forward-slash
  line: number;
  kind: string;
  text: string;
}

interface AllowlistEntry {
  file: string;
  text: string;
  reason: string;
}

// Matched by (file, exact literal text) rather than line number, so an
// unrelated edit elsewhere in the file can't silently break the match —
// and each entry is checked as USED below, so a fixed/removed string can't
// leave a stale, unexplained exception behind either.
const ALLOWLIST: AllowlistEntry[] = [
  {
    file: 'app/camera.tsx',
    text: 'VERDANT',
    reason:
      'Brand wordmark overlay on the camera screen. Brand names (Verdant / VERDANT / Premium) are never translated anywhere in this plan.',
  },
  {
    file: 'app/welcome.tsx',
    text: 'Moonlight',
    reason:
      'Decorative example plant nickname in the onboarding mock preview card. Plant names are always user content and are never routed through the catalog anywhere in the app (PlantCard.tsx renders plant.name directly) — this mock card mirrors that convention.',
  },
  {
    file: 'app/welcome.tsx',
    text: 'Philodendron hederaceum',
    reason:
      'Latin binomial (scientific species name) in the same onboarding mock card. Binomials are not translated.',
  },
];

function collectTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // __tests__ has no .tsx files today, but skip it on principle — this
    // guard is for shipped screens/components, not test fixtures.
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTsxFiles(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

/** True once a string has at least one letter — the "is this English text" heuristic. */
function hasLetters(s: string): boolean {
  return /\p{L}/u.test(s);
}

/**
 * The literal text content of a node the rules below inspect, or null if
 * `node` isn't one of the literal shapes we care about (identifiers,
 * call expressions like `t('key')`, member access, etc. all return null —
 * they're not hardcoded text sitting directly in the slot).
 */
function literalTextOf(
  node: ts.Expression
): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isTemplateExpression(node)) {
    // Join every literal quasi (head + each span's literal) — this is the
    // text that would render even if every ${...} substitution were blank.
    return [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join('');
  }
  return null;
}

function scanFile(filePath: string): Finding[] {
  const rel = path.relative(ROOT, filePath).split(path.sep).join('/');
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings: Finding[] = [];

  function lineOf(node: ts.Node): number {
    return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  }

  function record(node: ts.Node, kind: string, text: string) {
    if (!hasLetters(text)) return;
    findings.push({ file: rel, line: lineOf(node), kind, text: text.trim() });
  }

  // Examines an expression sitting in a "renders as text" slot (a JSX
  // attribute value, a <Text> child expression, an Alert.alert argument).
  // Recurses into ternary branches and `||`/`??` fallbacks so a hardcoded
  // literal hiding behind a condition still gets caught, e.g.
  // `label={loading ? 'Loading…' : t('x')}`.
  function checkExprSlot(expr: ts.Expression, kind: string) {
    const literal = literalTextOf(expr);
    if (literal != null) {
      record(expr, kind, literal);
      return;
    }
    if (ts.isConditionalExpression(expr)) {
      checkExprSlot(expr.whenTrue, kind);
      checkExprSlot(expr.whenFalse, kind);
    } else if (
      ts.isBinaryExpression(expr) &&
      (expr.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        expr.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      checkExprSlot(expr.left, kind);
      checkExprSlot(expr.right, kind);
    } else if (ts.isParenthesizedExpression(expr)) {
      checkExprSlot(expr.expression, kind);
    }
  }

  function isTextTag(tagName: ts.JsxTagNameExpression): boolean {
    if (ts.isIdentifier(tagName)) return tagName.text === 'Text';
    // <Animated.Text> (react-native-reanimated) — a PropertyAccessExpression
    // tag name, not a plain identifier.
    if (ts.isPropertyAccessExpression(tagName) && ts.isIdentifier(tagName.expression)) {
      return tagName.expression.text === 'Animated' && tagName.name.text === 'Text';
    }
    return false;
  }

  function isAlertAlertCall(node: ts.CallExpression): boolean {
    const callee = node.expression;
    return (
      ts.isPropertyAccessExpression(callee) &&
      callee.name.text === 'alert' &&
      ts.isIdentifier(callee.expression) &&
      callee.expression.text === 'Alert'
    );
  }

  function visit(node: ts.Node) {
    // Rule 1 — JSX attributes in TARGET_PROPS.
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && TARGET_PROPS.has(node.name.text)) {
      const init = node.initializer;
      if (init) {
        if (ts.isStringLiteral(init)) {
          checkExprSlot(init, `jsx-attr:${node.name.text}`);
        } else if (ts.isJsxExpression(init) && init.expression) {
          checkExprSlot(init.expression, `jsx-attr:${node.name.text}`);
        }
      }
    }

    // Rule 4 — Stack.Screen / Tabs.Screen options={{ title, tabBarAccessibilityLabel }}.
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && node.name.text === 'options') {
      const init = node.initializer;
      if (init && ts.isJsxExpression(init) && init.expression && ts.isObjectLiteralExpression(init.expression)) {
        for (const prop of init.expression.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            NAV_OPTION_PROPS.has(prop.name.text)
          ) {
            checkExprSlot(prop.initializer, `nav-options:${prop.name.text}`);
          }
        }
      }
    }

    // Rule 2 — bare <Text>/<Animated.Text> children.
    if (ts.isJsxElement(node) && isTextTag(node.openingElement.tagName)) {
      for (const child of node.children) {
        if (ts.isJsxText(child)) {
          const text = child.text.replace(/\s+/g, ' ').trim();
          if (text) record(child, 'jsx-text-child', text);
        } else if (ts.isJsxExpression(child) && child.expression) {
          checkExprSlot(child.expression, 'jsx-text-expr');
        }
      }
    }

    // Rule 3 — Alert.alert(...) arguments.
    if (ts.isCallExpression(node) && isAlertAlertCall(node)) {
      const [titleArg, messageArg, buttonsArg] = node.arguments;
      if (titleArg) checkExprSlot(titleArg, 'alert-title');
      if (messageArg) checkExprSlot(messageArg, 'alert-message');
      if (buttonsArg && ts.isArrayLiteralExpression(buttonsArg)) {
        for (const el of buttonsArg.elements) {
          if (ts.isObjectLiteralExpression(el)) {
            for (const prop of el.properties) {
              if (
                ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                prop.name.text === 'text'
              ) {
                checkExprSlot(prop.initializer, 'alert-button-text');
              }
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);
  return findings;
}

function scanAll(): Finding[] {
  const files = [
    ...collectTsxFiles(path.join(ROOT, 'app')),
    ...collectTsxFiles(path.join(ROOT, 'components')),
  ];
  return files.flatMap(scanFile);
}

describe('i18n coverage guard (Task 8)', () => {
  const findings = scanAll();
  const usedAllowlist = new Set<number>();

  const surviving = findings.filter((f) => {
    const idx = ALLOWLIST.findIndex((a) => a.file === f.file && a.text === f.text);
    if (idx === -1) return true;
    usedAllowlist.add(idx);
    return false;
  });

  it('finds no unexplained hardcoded user-facing strings in app/**/*.tsx or components/**/*.tsx', () => {
    if (surviving.length > 0) {
      const report = surviving
        .map((f) => `  ${f.file}:${f.line} [${f.kind}] ${JSON.stringify(f.text)}`)
        .join('\n');
      throw new Error(
        `Found ${surviving.length} hardcoded user-facing string(s):\n${report}\n\n` +
          `Either translate it (add a catalog key in all four languages and call ` +
          `t('...')), or — if this is a genuine carve-out (brand name, Latin ` +
          `binomial, etc.) — add it to the ALLOWLIST in this file with a reason.`
      );
    }
    expect(surviving).toEqual([]);
  });

  // Mirrors the orphan-key idea from palette.test.ts's CATEGORY_HUES
  // assertion (progress.md's "Minor findings deferred to final review"): an
  // allowlist entry that stops matching (because the string was fixed,
  // reworded, or the file moved) should fail loudly, not sit there
  // forever as untested dead weight nobody notices.
  it('keeps the allowlist honest — every entry still matches a real finding', () => {
    const stale = ALLOWLIST.filter((_, i) => !usedAllowlist.has(i));
    expect(
      stale,
      `Stale allowlist entries (no longer produced by the scan — remove or fix): ${JSON.stringify(stale, null, 2)}`
    ).toEqual([]);
  });
});
