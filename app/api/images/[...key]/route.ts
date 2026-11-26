import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Strictly allowed image MIME types (no SVG to avoid stored XSS script injection)
const ALLOWED_IMAGE_MIMES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
}

const DEFAULT_LOCAL_DATASET_DIR =
  'C:/Penyimpanan Utama/Materi dan Tugas/dataset lukisan indonesia/indonesian_images/final pick'

/**
 * Hardened Image Streaming Route Handler
 * Serves local dataset images with strict extension whitelisting,
 * anti-path-traversal boundary checks, and security headers.
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await props.params

    if (!key || key.length === 0) {
      return new NextResponse('Bad Request: Image key is required', {
        status: 400,
      })
    }

    // Sanitize each path segment to prevent path traversal
    const safeSegments = key.map((segment) => path.basename(segment.trim()))
    const rawFilename = safeSegments[safeSegments.length - 1]
    const filename = path.basename(rawFilename)
    const relativeSubpath = safeSegments.join('/')

    // Enforce strictly whitelisted image extension
    const ext = path.extname(filename).toLowerCase()
    const contentType = ALLOWED_IMAGE_MIMES[ext]

    if (!contentType) {
      return new NextResponse('Forbidden: Hanya berkas gambar yang diizinkan', {
        status: 403,
      })
    }

    // Lookup directories in priority order:
    const candidateDirs = [
      process.env.LOCAL_IMAGES_DIR,
      DEFAULT_LOCAL_DATASET_DIR,
      path.join(process.cwd(), 'public', 'paintings'),
      path.join(process.cwd(), 'public', 'images'),
    ].filter(Boolean) as string[]

    let targetFilePath: string | null = null

    for (const dir of candidateDirs) {
      const canonicalDir = path.resolve(dir)

      // 1. Check exact relative subpath
      const fullSubpath = path.resolve(canonicalDir, relativeSubpath)
      // Anti-traversal guard: ensure target file stays strictly inside canonicalDir
      if (
        fullSubpath.startsWith(canonicalDir) &&
        fs.existsSync(fullSubpath) &&
        fs.statSync(fullSubpath).isFile()
      ) {
        targetFilePath = fullSubpath
        break
      }

      // 2. Check bare filename in directory
      const fullFilename = path.resolve(canonicalDir, filename)
      if (
        fullFilename.startsWith(canonicalDir) &&
        fs.existsSync(fullFilename) &&
        fs.statSync(fullFilename).isFile()
      ) {
        targetFilePath = fullFilename
        break
      }
    }

    if (!targetFilePath) {
      return new NextResponse(`Image not found: ${filename}`, {
        status: 404,
      })
    }

    const fileBuffer = fs.readFileSync(/* turbopackIgnore: true */ targetFilePath)

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'none'",
      },
    })
  } catch (error: any) {
    console.error('Error streaming mock image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
