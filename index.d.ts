declare module "node-email-reply-parser" {
  interface Fragment {
    getContent(): string;
    isSignature(): boolean;
    isQuoted(): boolean;
    isHidden(): boolean;
    isEmpty(): boolean;
  }
  interface Email {
    getFragments(): Fragment[];
    getVisibleText(options?: {
      /**
       * When true, treats non-hidden fragments surrounded by hidden fragments as hidden.
       * Default false.
       */
      aggressive?: boolean;
    } = {}): string;
  }
  const replyParser: (emailContent: string) => Email;
  export = replyParser;
}
