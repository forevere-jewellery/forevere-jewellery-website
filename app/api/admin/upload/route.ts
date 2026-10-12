import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    // 1. Verify admin authorization
    const authCheck = await verifyAdminRequest(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are permitted.' },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds the 5MB maximum limit.' },
        { status: 400 }
      );
    }

    // 4. Upload to Supabase Storage if configured
    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        return NextResponse.json({ success: false, error: 'Storage upload failed.' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      return NextResponse.json({
        success: true,
        url: publicUrlData.publicUrl,
      });
    }

    // Fallback response for dev environment
    return NextResponse.json({
      success: true,
      url: `/images/products/${file.name}`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during file upload.' },
      { status: 500 }
    );
  }
}
