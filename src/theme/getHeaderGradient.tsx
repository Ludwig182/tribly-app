type HeaderName = 'home'|'calendar'|'tasks'|'shopping'|'family'|…;
export function getHeaderGradient(header: HeaderName, colors: ThemeColors): [string, string] {
  switch(header) {
    case 'home':      return [colors.primary,   colors.secondary];
    case 'calendar':  return [colors.secondary, colors.primary];
    case 'tasks':     return [colors.accent,    colors.primary];
    case 'shopping':  return [colors.secondary, colors.accent];
    case 'family':    return [colors.secondary, colors.primary];
    // … autres écrans
  }
}
