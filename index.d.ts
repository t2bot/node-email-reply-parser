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
    }): string;
  }
  type ReplyParserRegular = (emailContent: string) => Email;
  type ReplyParserVisibleTextOnly = (emailContent: string, visibleTextOnly: true) => string;
  const replyParser: ReplyParserRegular & ReplyParserVisibleTextOnly;
  export = replyParser;
}
