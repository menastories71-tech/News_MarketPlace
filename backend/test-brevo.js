const SibApiV3Sdk = require('@getbrevo/brevo');

console.log('Brevo package loaded successfully');
console.log('Available methods:', Object.keys(SibApiV3Sdk));

try {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  console.log('ApiClient instance available:', !!defaultClient);
  
  if (defaultClient && defaultClient.authentications) {
    console.log('Authentications available:', Object.keys(defaultClient.authentications));
  }
} catch (error) {
  console.error('Error accessing ApiClient:', error.message);
}
