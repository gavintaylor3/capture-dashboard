/* ── STORAGE KEYS ──
   Single source for the localStorage namespace + export-file prefix.
   Extracted from App.jsx (PR 2); values are byte-identical to the originals
   so existing users' data keys are unchanged. */

const NS='astrion';

export const KEYS={
  opps:`${NS}_opps`,
  pastperfs:`${NS}_pastperfs`,
  proofpoints:`${NS}_proofpoints`,
  files:`${NS}_files`,
  gcompetitors:`${NS}_gcompetitors`,
  blackhats:`${NS}_blackhats`,
};

export const exportFilePrefix=`${NS}-capture`;
