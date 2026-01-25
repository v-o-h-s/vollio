declare module "xss-filters" {
  export function inHTMLData(input: string): string;
  export function inDoubleQuotedAttr(input: string): string;
  export function inSingleQuotedAttr(input: string): string;
  export function inUnQuotedAttr(input: string): string;
  export function uriInHTMLData(input: string): string;
  export function uriInSingleQuotedAttr(input: string): string;
  export function uriInDoubleQuotedAttr(input: string): string;
  export function uriInUnQuotedAttr(input: string): string;
  export function uriPathInHTMLData(input: string): string;
  export function uriPathInSingleQuotedAttr(input: string): string;
  export function uriPathInDoubleQuotedAttr(input: string): string;
  export function uriPathInUnQuotedAttr(input: string): string;
  export function uriQueryInHTMLData(input: string): string;
  export function uriQueryInSingleQuotedAttr(input: string): string;
  export function uriQueryInDoubleQuotedAttr(input: string): string;
  export function uriQueryInUnQuotedAttr(input: string): string;
  export function uriComponentInHTMLData(input: string): string;
  export function uriComponentInSingleQuotedAttr(input: string): string;
  export function uriComponentInDoubleQuotedAttr(input: string): string;
  export function uriComponentInUnQuotedAttr(input: string): string;
  export function uriFragmentInHTMLData(input: string): string;
  export function uriFragmentInSingleQuotedAttr(input: string): string;
  export function uriFragmentInDoubleQuotedAttr(input: string): string;
  export function uriFragmentInUnQuotedAttr(input: string): string;
}
