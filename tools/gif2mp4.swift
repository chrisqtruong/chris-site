// gif2mp4 in.gif out.mp4 quality(0-1) — re-encodes an animated GIF as H.264 MP4 with the GIF's own frame timing.
import Foundation
import AVFoundation
import ImageIO
import CoreGraphics
import CoreVideo
let a = CommandLine.arguments
let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil)!
let n = CGImageSourceGetCount(src)
let first = CGImageSourceCreateImageAtIndex(src, 0, nil)!
let W = (first.width + 1) / 2 * 2, H = (first.height + 1) / 2 * 2
let out = URL(fileURLWithPath: a[2]); try? FileManager.default.removeItem(at: out)
let w = try! AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  // tag the colors as standard web video (BT.709) so browsers show them exactly like the GIF
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
  AVVideoCompressionPropertiesKey: [AVVideoQualityKey: Double(a[3])!, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 120]])
let ad = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
w.add(input); w.startWriting(); w.startSession(atSourceTime: .zero)
var t = 0.0
// GIF frames can be partial; draw each onto a running canvas
let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue)!
for i in 0..<n {
  let img = CGImageSourceCreateImageAtIndex(src, i, nil)!
  let props = CGImageSourceCopyPropertiesAtIndex(src, i, nil) as! [String: Any]
  let g = props[kCGImagePropertyGIFDictionary as String] as? [String: Any] ?? [:]
  var d = (g[kCGImagePropertyGIFUnclampedDelayTime as String] as? Double) ?? (g[kCGImagePropertyGIFDelayTime as String] as? Double) ?? 0.1
  if d < 0.02 { d = 0.1 }
  ctx.draw(img, in: CGRect(x: 0, y: H - img.height, width: img.width, height: img.height))
  var pb: CVPixelBuffer?; CVPixelBufferPoolCreatePixelBuffer(nil, ad.pixelBufferPool!, &pb)
  CVBufferSetAttachment(pb!, kCVImageBufferColorPrimariesKey, kCVImageBufferColorPrimaries_ITU_R_709_2, .shouldPropagate)
  CVBufferSetAttachment(pb!, kCVImageBufferTransferFunctionKey, kCVImageBufferTransferFunction_sRGB, .shouldPropagate)
  CVBufferSetAttachment(pb!, kCVImageBufferYCbCrMatrixKey, kCVImageBufferYCbCrMatrix_ITU_R_709_2, .shouldPropagate)
  CVPixelBufferLockBaseAddress(pb!, [])
  let pctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue)!
  pctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1)); pctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
  pctx.draw(ctx.makeImage()!, in: CGRect(x: 0, y: 0, width: W, height: H))
  CVPixelBufferUnlockBaseAddress(pb!, [])
  while !input.isReadyForMoreMediaData { usleep(1000) }
  ad.append(pb!, withPresentationTime: CMTime(seconds: t, preferredTimescale: 600))
  t += d
}
input.markAsFinished()
w.endSession(atSourceTime: CMTime(seconds: t, preferredTimescale: 600))   // keep the last frame's full duration
let sem = DispatchSemaphore(value: 0); w.finishWriting { sem.signal() }; sem.wait()
print("\(a[1].split(separator: "/").last!): \(n) frames, \(String(format: "%.1f", t))s, \(W)x\(H)")
