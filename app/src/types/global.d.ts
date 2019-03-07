declare global {
  interface Date {
    format(fmt: string): string
    getToday(): string
  }
}

export {}
