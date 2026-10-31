const configurationError = new Error(
  'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
);

/** Chainable empty query used only when production Supabase configuration is missing. */
export function createUnavailableQuery(): any {
  const builder: any = {
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    in() {
      return builder;
    },
    order() {
      return builder;
    },
    limit() {
      return builder;
    },
    insert() {
      return builder;
    },
    update() {
      return builder;
    },
    upsert() {
      return builder;
    },
    delete() {
      return builder;
    },
    async single() {
      return { data: null, error: configurationError };
    },
    async maybeSingle() {
      return { data: null, error: configurationError };
    },
    then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
      return Promise.resolve({ data: [], error: configurationError }).then(onfulfilled, onrejected);
    },
  };

  return builder;
}