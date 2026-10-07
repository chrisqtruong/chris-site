// One photo in, one clean JPEG out: turned the right way up, resized so its long side is at most MAX px,
// and written WITHOUT the original's metadata (no GPS location, no serial numbers). Colour profile kept.
// Prints the camera and date it read, as JSON, so the gallery can show them.
// usage: photo-export <in> <out.jpg> <max long side> <quality 0-1>
import Foundation
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
guard a.count == 5, let maxSide = Int(a[3]), let q = Double(a[4]) else { print("usage: photo-export in out max quality"); exit(2) }
let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil)!
let props = CGImageSourceCopyPropertiesAtIndex(src, 0, nil) as? [String: Any] ?? [:]
let w = props[kCGImagePropertyPixelWidth as String] as? Int ?? 0, h = props[kCGImagePropertyPixelHeight as String] as? Int ?? 0
let opts: [CFString: Any] = [kCGImageSourceCreateThumbnailFromImageAlways: true, kCGImageSourceCreateThumbnailWithTransform: true,
                             kCGImageSourceThumbnailMaxPixelSize: min(maxSide, max(w, h)), kCGImageSourceShouldCacheImmediately: true]
let img = CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary)!
let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dst, img, [kCGImageDestinationLossyCompressionQuality: q] as CFDictionary)   // no source properties: metadata stays behind
guard CGImageDestinationFinalize(dst) else { exit(1) }
let tiff = props[kCGImagePropertyTIFFDictionary as String] as? [String: Any] ?? [:]
let exif = props[kCGImagePropertyExifDictionary as String] as? [String: Any] ?? [:]
let cam = [tiff[kCGImagePropertyTIFFMake as String] as? String, tiff[kCGImagePropertyTIFFModel as String] as? String].compactMap { $0 }.joined(separator: " ")
let date = (exif[kCGImagePropertyExifDateTimeOriginal as String] as? String ?? "").prefix(10).replacingOccurrences(of: ":", with: "-")
let out = ["w": img.width, "h": img.height, "camera": cam, "date": date] as [String: Any]
print(String(data: try! JSONSerialization.data(withJSONObject: out), encoding: .utf8)!)
