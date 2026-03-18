// Omise payment gateway — credentials pending from company
// All functions are no-ops until OMISE_SECRET_KEY is configured

const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY;

export const isOmiseConfigured = (): boolean => !!OMISE_SECRET_KEY;
