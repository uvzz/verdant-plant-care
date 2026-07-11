export const Share = {
  share: async () => ({ action: 'sharedAction' }),
};

export const Platform = {
  OS: 'ios',
  select: <T,>(obj: { ios?: T; android?: T; default?: T }) =>
    obj.ios ?? obj.default,
};

export default { Share, Platform };
