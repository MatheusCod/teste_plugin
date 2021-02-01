
// Generic example of a service that provides data.
/** @type {?Object<string, !Array<string>>} */
let runToTagInfo = null;

async function updateRunInfo() {
  if (!runToTagInfo) {
    runToTagInfo = (await fetchJSON('./tags')) || {};
  }
}

/**
 * @return {!Promise<!Array<string>>}
 */
export async function getRuns() {
  await updateRunInfo();
  return Object.keys(runToTagInfo);
}

/**
 * @param {string} run
 * @return {!Promise<!Map<string, Array<Object>>>}
 */
export async function getTagsToScalars(run) {
  const result = new Map();
  const tags = await getTags(run);
  if (!tags) {
    return result;
  }

  const scalarPromises = tags.map(async (tag) => {
    const scalars = await getScalars(run, tag);
    if (scalars) {
      result.set(tag, scalars);
    }
  });
  await Promise.all(scalarPromises);

  return result;
}

/**
 * @param {string} run
 * @return {!Promise<?Array<string>>}
 */
async function getTags(run) {
  await updateRunInfo();
  return runToTagInfo[run] || null;
}

/**
 * @param {string} run
 * @param {string} tag
 * @return {!Promise<?Object>}
 */
async function getScalars(run, tag) {
  const params = new URLSearchParams({run, tag});
  return await fetchJSON(`./scalars?${params}`);
}

/**
 * @param {string} url
 * @return {!Promise<?Object>}
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}
