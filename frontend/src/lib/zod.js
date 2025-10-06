import {z} from 'zod';

export const loginSchema = z.object({
    email: z.string().min(1, "Email wajib barus diisi").email("Email tidak valid"),
    password: z.string().min(1, "Password wajib diisi")
})

export const editProfilSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 huruf"),
    email: z.string().min(1, "Email wajib barus diisi").email("Email tidak valid"),
})

export const editPasswordSchema = z.object({
    password_lama: z.string().min(1, "Password lama harus diisi"),
    password: z.string().min(8, "Password minimal terdiri dari 8 huruf"),
    password_confirmation: z.string().min(1, "Konfirmasi password harus diisi")
}).refine((data) => data.password === data.password_confirmation, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["password"]
}).refine((data) => data.password === data.password_confirmation, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["password_confirmation"]
})

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const imageSchema = z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Ukuran gambar terlalu besar, max 5 MB"
}).refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Format gambar harus JPG, JPEG, PNG, atau WEBP",
})

export const beritaSchema = z.object({
    judul: z.string().min(1, "Judul berita wajib diisi"),
    isi: z.string().min(20, "Isi berita minimal 100 karakter"),
    kategori: z.array(z.number().int().positive(), {
        required_error: "Kategori wajib diisi",
        invalid_type_error: "Kategori harus berupa array id",
  }).min(1, "Minimal pilih 1 kategori").max(3, "Maksimal pilih 3 kategori"),
    banner: imageSchema,
    published: z.boolean()
}) 
export const beritaSchemaEdit = z.object({
    judul: z.string().min(1, "Judul berita wajib diisi").optional(),
    isi: z.string().min(20, "Isi berita minimal 100 karakter").optional(),
    kategori: z.array(z.number().int().positive(), {
        required_error: "Kategori wajib diisi",
        invalid_type_error: "Kategori harus berupa array id",
  }).min(1, "Minimal pilih 1 kategori").max(3, "Maksimal pilih 3 kategori").optional(),
    banner: imageSchema.optional(),
    published: z.boolean().optional()
}) 

export const userSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 huruf"),
    email: z.string().min(1, "Email wajib barus diisi").email("Email tidak valid"),
    role_id: z.number().int().positive("Role tidak valid"),
    password: z.string().min(8, "Password minimal terdiri dari 8 huruf"),
    password_confirmation: z.string().min(1, "Konfirmasi password harus diisi"),
    profil: imageSchema.optional()
}).refine((data) => data.password === data.password_confirmation, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["password"]
}).refine((data) => data.password === data.password_confirmation, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["password_confirmation"]
})

export const userSchemaEdit = z.object({
    name: z.string().min(3, "Nama minimal 3 huruf").optional(),
    email: z.string().min(1, "Email wajib barus diisi").email("Email tidak valid").optional(),
    role_id: z.number().int().positive("Role tidak valid").optional(),
    profil: imageSchema.optional()
})

export const roleSchema = z.object({
    role: z.string().min(3, "Nama minimal 3 huruf"),
});

export const kategoriSchema = z.object({
    kategori: z.string().min(3, "Nama minimal 3 huruf"),
});