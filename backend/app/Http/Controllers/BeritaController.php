<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Berita;
use App\Models\Kategori;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class BeritaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Filter dan Search
        $sort = $request->json('sort', 'created_at'); // Kolom Apa yang akan diurutkan 

        // ASC : Dari terkecil ke yang terbesar
        // DESC : Dari terbesar ke yang terkeci;
        // Jika kita gunakan di created_at amaka DESC adalah mengurutkan postingan yang paling baru
        $order = strtoupper($request->json('order', 'DESC')); // strtoupper digunakan untuk mengubah huruf menjadi kapital semua
        $start = $request->json('start', null); // Digunakan Untuk Pengambilan Data Mulai dari data keberapa
        $end = $request->json('end', null); // Digunakan untuk pengambilan data akhir jadi start sampai end
        $filters = $request->json('filters', []); // digunakan untuk mencari sesuai key dan field di database
        $fixfilters = $request->json('fixfilters', []); // digunakan untuk mencari sesuai key dan field di database

        // Dapatkan daftar field yang valid dari tabel 'berita'
        $validColumns = Schema::getColumnListing('berita');

        // Validasi order (hanya ASC atau DESC)
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }

        // Validasi sort (jika tidak valid, gunakan default: created_at)
        if (!in_array($sort, $validColumns)) { 
            $sort = 'created_at';
        }

        // Query Berita dengan eager loading
        $query = Berita::with(['user', 'kategori'])->withCount('likes');

        // Apply filtering jika ada dan field valid
        if (!empty($filters)) {
            foreach ($filters as $field => $value) {
                if ($field === 'kategori_id') {
                    // filter berdasarkan kategori (pivot)
                    $query->whereHas('kategori', function ($q) use ($value) {
                        $q->where('kategori_id', $value);
                    });
                } elseif (in_array($field, $validColumns)) {
                    // filter biasa (langsung kolom berita)
                    $query->where($field, 'LIKE', "%$value%");
                }
            }
        }

        if (!empty($fixfilters)) {
            foreach ($fixfilters as $field => $value) {
                if ($field === 'kategori_id') {
                    $query->whereHas('kategori', function ($q) use ($value) {
                        $q->where('kategori_id', $value);
                    });
                } elseif (in_array($field, $validColumns)) {
                    $query->where($field, $value);
                }
            }
        }


        // Apply sorting (hanya jika field valid)
        $query->orderBy($sort, $order);

        // Jika start dan end ada, gunakan paginasi manual
        if (!is_null($start) && !is_null($end)) {
            $query->skip($start)->take($end - $start);
        }

        // Ambil data
        $berita = $query->get();

        if($berita->isEmpty()){        
            return response()->json([
                'success' => false,
                'pesan' => 'Data Berita Kosong',
            ], 404);
            
            } else {
            return response()->json([
                'success' => true,
                'data' => $berita,
            ], 200);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'judul' => 'required|min:5|max:100',
            'isi' => 'required|min:100',
            'kategori' => 'required|array|min:1',
            'kategori.*' => 'exists:kategori,id',
            'banner' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'published' => 'sometimes|boolean',
        ],[
            // masukkan pesan error kamu di sini
            'judul.required' => 'Kolom Judul Berita Harus Diisi',
            'judul.min' => 'Kolom Judul Berita Minimal 5 kata',
            'judul.max' => 'Kolom Judul Berita Maksimal 100',
            'isi.required' => 'Isi Berita Harus Diisi',
            'isi.min' => 'Isi Berita Minimal 100 Kata',
            'kategori.required' => 'Kategori Diisi minimal 1',
            'kategori.array' => 'Kategori Harus Berupa Array',
            'kategori.min' => 'Kategori Diisi minimal 1',
            'kategori.*.exists' => 'Data Kategori Yang Tidak Ada Di Data Kami',
            'banner.required' => 'Foto Berita Harus Diisi',
            'banner.image' => 'Foto Harus Berbentuk Image',
            'banner.mimes' => 'Foto Harus Berbentuk PNG, JPEG, JPG, GIF, WEBP',
            'banner.max' => 'Foto Dilarang Lebih Dari 2MB',
            'published.boolean' => 'Published Harus Berbentuk Boolean',
        ]);

        // jika sudah memakai login hapus user_id di atas dan gunakan kode di bawah ini
        $validate['user_id'] = auth()->user()->id;

        // Simpan Gambar
        $file = $request->file('banner');
        $filename = time() .'_'. Str::random(5) . '.' . $file->getClientOriginalExtension();
        $file->storeAs('berita', $filename, 'public');
        $validate['banner'] = $filename;
        // jika berhasil masukkan datanya ke database
        $beritaBuat = Berita::create($validate);

        // masukkan kategori ke database 
        $beritaBuat->kategori()->attach($validate['kategori']);

        if($beritaBuat) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil ditambahkan',
                'data' => $beritaBuat,
            ], 200);
        } else {
            // kirimkan pesan gagal 
            return response()->json([
                'success' => false,
                'pesan' => 'Data Gagal ditambahkan',           
            ], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // temukan data berdasarkan id
        $berita = Berita::with(['user', 'kategori', 'likes'])->find($id);

        if(is_null($berita)){    
            return response()->json([
                'success' => false,
                'data' => 'Data Berita Tidak Ditemukan',
            ], 404);
            
        }

        $session_key = 'berita_' . $id . '_viewed';
        if(!session()->has($session_key)) {
            $berita->increment('views');
            session()->put($session_key, true);
        }

        return response()->json([
            'success' => true,
            'data' => $berita,
        ], 200);
        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $berita = Berita::find($id);
        if(is_null($berita)){    
            return response()->json([
                'success' => false,
                'data' => 'Data Berita Tidak Ditemukan',
            ], 404);
        }

        $validate = $request->validate([
            'judul' => 'sometimes|required|min:5|max:100',
            'isi' => 'sometimes|required|min:100',
            'kategori' => 'sometimes|required|array|min:1',
            'kategori.*' => 'exists:kategori,id',
            'banner' => 'sometimes|required|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'published' => 'sometimes|boolean',
        ],[
            // masukkan pesan error kamu di sini
            'judul.required' => 'Kolom Judul Berita Harus Diisi',
            'judul.min' => 'Kolom Judul Berita Minimal 5 kata',
            'judul.max' => 'Kolom Judul Berita Maksimal 100',
            'isi.required' => 'Isi Berita Harus Diisi',
            'isi.min' => 'Isi Berita Minimal 100 Kata',
            'kategori.required' => 'Kategori Diisi minimal 1',
            'kategori.array' => 'Kategori Harus Berupa Array',
            'kategori.min' => 'Kategori Diisi minimal 1',
            'kategori.*.exists' => 'Data Kategori Yang Tidak Ada Di Data Kami',
            'banner.required' => 'Foto Harus Diisi',
            'banner.image' => 'Foto Harus Berbentuk Image',
            'banner.mimes' => 'Foto Harus Berbentuk PNG, JPEG, JPG, GIF, WEBP',
            'banner.max' => 'Foto Dilarang Lebih Dari 2MB',
            'published.boolean' => 'Published Harus Berbentuk Boolean',
        ]);

        // jika sudah memakai login gunakan kode di bawah ini
        if(auth()->user()->id != $berita->user_id){
            return response()->json([
                'success' => false,
                'pesan' => 'Anda Tidak Memiliki Akses Untuk Mengedit Berita Ini',           
            ], 403);
        }

        // Simpan Gambar
        if($request->hasFile('banner')) {
            $file = $request->file('banner');
            // Hapus foto lama jika ada
            if ($berita->banner && Storage::disk('public')->exists('berita/' . $berita->banner)) {
                Storage::disk('public')->delete('berita/' . $berita->banner);
            }
            $filename = time() .'_'. Str::random(5) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('berita', $filename, 'public');
            $validate['banner'] = $filename;
        } 

        // jika berhasil masukkan datanya ke database
        $beritaUpdate = $berita->update($validate);

        // masukkan kategori ke database 
        if(isset($validate['kategori'])) {
            $berita->kategori()->sync($validate['kategori']);
        }

        if($beritaUpdate) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil diedit',
                'data' => $berita,
            ], 200);
        } else {
            // kirimkan pesan gagal 
            return response()->json([
                'success' => false,
                'pesan' => 'Data Gagal diedit',           
            ], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $berita = Berita::find($id);

        if(is_null($berita)){    
            return response()->json([
                'success' => true,
                'data' => 'Data Berita Kosong',
            ], 404);
            
        }

        try {
            // hapus tags_Berita berdasarkan Berita yang dihapus
            $berita->kategori()->detach(); // Aktifkan ini jika harus menghapus kategori yang berelasi dengan Berita yang dihapus
            $deleteBerita = $berita->delete();
            if ($berita->banner && Storage::disk('public')->exists('berita/' . $berita->banner)) {
                Storage::disk('public')->delete('berita/' . $berita->banner);
            }

        } catch(\Exception $e) {

            return response()->json([
                'success' => false, 
                'pesan' => 'Berita gagal Dihapus Ada Yang Error '.$e->getMessage(),
            ], 400);
        }

        if($deleteBerita) {
            // Kembalikan response sukses
            return response()->json([
                'success' => true,
                'pesan' => 'Berita Berhasil Dihapus',
            ], 200);
        } else {
            // Jika Berita tidak ditemukan
            return response()->json([
                'success' => false, 
                'pesan' => 'Berita Gagal Dihapus',
            ], 400);
        }
    }

    public function like(Request $request) {
        $validate = $request->validate([
            'berita_id' => 'required|exists:berita,id'
        ], [
            'berita_id.required' => 'Kolom Berita ID Harus Diisi',
            'berita_id.exists' => 'Data Berita ID Tidak Sesuai'
        ]);

        $user = auth()->user();
        $dataBerita = Berita::find($validate['berita_id']);

        if($user->likedBerita()->where('berita_id', $dataBerita->id)->exists()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Berita Ini Sudah Di Like Sebelumnya'
            ]);
        }

        // Tambahkan Like
        $user->likedBerita()->attach($dataBerita->id);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil Menambahkan Like',
        ]);

    }

    public function unlike(Request $request) {
       $validate = $request->validate([
            'berita_id' => 'required|exists:berita,id'
        ], [
            'berita_id.required' => 'Kolom Berita ID Harus Diisi',
            'berita_id.exists' => 'Data Berita ID Tidak Sesuai'
        ]);

        $user = auth()->user();
        $dataBerita = Berita::find($validate['berita_id']);

        if(!$user->likedBerita()->where('berita_id', $dataBerita->id)->exists()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Berita Ini Belum Di Like Sebelumnya'
            ]);
        }

        // Hapus Like
        $user->likedBerita()->detach($dataBerita->id);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil Menghapus Like',
        ]);
    }

    public function populer(Request $request) {
        $limit = $request->json('limit', 6); 

        if (!is_int($limit) || $limit <= 0) {
            $limit = 6; 
        }

        $berita = Berita::with(['user', 'kategori'])
            ->withCount('likes')
            ->orderBy('likes_count', 'DESC')
            ->take($limit)
            ->get();

        if ($berita->isEmpty()) {
            return response()->json([
                'success' => false,
                'pesan' => 'Data Berita Kosong',
            ], 404);
        } else {
            return response()->json([
                'success' => true,
                'data' => $berita,
            ], 200);
        }
    }

    public function terbaru(Request $request) {
        $limit = $request->json('limit', 4); 

        if (!is_int($limit) || $limit <= 0) {
            $limit = 4; 
        }

        $berita = Berita::with(['user', 'kategori'])
            ->orderBy('created_at', 'DESC')
            ->take($limit)
            ->get();

        if ($berita->isEmpty()) {
            return response()->json([
                'success' => false,
                'pesan' => 'Data Berita Kosong',
            ], 404);
        } else {
            return response()->json([
                'success' => true,
                'data' => $berita,
            ], 200);
        }
    }

    public function getDetailBeritaku(Request $request) {
        $userId = $request->user()->id;
        $data = Berita::where('user_id', $userId)
            ->get();

        $totalViews = $data->sum('views');
        $totalBerita = $data->count();
        $totalKategori = Kategori::count();
        $viewsPerBulan = Berita::where('user_id', $userId)
                        ->selectRaw('YEAR(created_at) as tahun, MONTH(created_at) as bulan, SUM(views) as total_views')
                        ->whereYear('created_at', Carbon::now()->year)
                        ->groupBy('tahun', 'bulan')
                        ->orderBy('tahun')
                        ->orderBy('bulan')
                        ->get();


        return response()->json([
            'sukses' => true,
            'data' => [
                'berita'        => $totalBerita,
                'views'         => $totalViews,
                'viewstrafic'   => $viewsPerBulan,
                'kategori'      => $totalKategori
            ]
        ]);
    }
}
