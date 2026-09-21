import test from 'node:test';
import assert from 'node:assert/strict';
import { stepNeedsImage, stepProducesImage } from '../lib/skill-runtime.ts';

test('direct image-to-text listing receives the SKU image',()=>{
  assert.equal(stepNeedsImage('listing_text','original'),true);
  assert.equal(stepNeedsImage('listing_text','previous'),false);
  assert.equal(stepNeedsImage('vision','previous'),true);
});

test('text outputs are not mistaken for generated images',()=>{
  assert.equal(stepProducesImage('image_edit'),true);
  assert.equal(stepProducesImage('listing_text'),false);
  assert.equal(stepProducesImage('pricing'),false);
});
