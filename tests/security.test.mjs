import test from 'node:test';
import assert from 'node:assert/strict';
import { decryptSecret, encryptSecret, publicationIssues, redactSecrets, validatePublicBaseUrl } from '../lib/security.ts';
test('model URL validation rejects unsafe addresses and credentials',()=>{
 for(const value of ['http://api.example.com/v1','https://localhost/v1','https://127.0.0.1/v1','https://10.0.0.1/v1','https://user:pass@example.com/v1','https://api.example.com/v1?api_key=x'])assert.throws(()=>validatePublicBaseUrl(value));
 assert.equal(validatePublicBaseUrl('https://api.example.com/v1/'),'https://api.example.com/v1');
});
test('AES-GCM roundtrip and publication scan',async()=>{
 const key='a-long-master-key-used-only-for-tests-1234567890';const encrypted=await encryptSecret('secret-value',key);assert.notEqual(encrypted,'secret-value');assert.equal(await decryptSecret(encrypted,key),'secret-value');assert(publicationIssues('Bearer abcdefghijklmnop').length);assert.equal(redactSecrets('Bearer abcdefghijklmnop'),'[REDACTED]');
});
