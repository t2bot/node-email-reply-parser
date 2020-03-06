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
    getVisibleText(): string;
  }
  const replyParser: (emailContent: string) => Email;
  export = replyParser;
}
