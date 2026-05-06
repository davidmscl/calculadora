const assets = []

export function registerAsset(asset) {
  assets.push(asset)
  return assets.length - 1
}

export function getAssetByID(id) {
  return assets[id]
}
