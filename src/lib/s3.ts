// AWS S3 — credentials pending from company
// All functions are no-ops until AWS_* vars are configured

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

export const isS3Configured = (): boolean =>
  !!(AWS_ACCESS_KEY_ID && AWS_S3_BUCKET);
