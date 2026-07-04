let url = $state(new URL("http://localhost"));

/** Stand-in for the `page` object of `$app/state`. */
export const page = {
  get url() {
    return url;
  },
  params: {},
  route: { id: "/" },
  status: 200,
  error: null,
  data: {},
  form: null,
  state: {},
};

/**
 * Replaces the URL the mocked `page` reports.
 *
 * @param next - the URL subsequent reads of `page.url` should observe
 */
export function setPageUrl(next: URL): void {
  url = next;
}
