<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class KategoriController extends Controller
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

        // Dapatkan daftar field yang valid dari tabel 'kategori'
        $validColumns = Schema::getColumnListing('kategori');

        // Validasi order (hanya ASC atau DESC)
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }

        // Validasi sort (jika tidak valid, gunakan default: created_at)
        if (!in_array($sort, $validColumns)) { 
            $sort = 'created_at';
        }

        // Query Kategori dengan eager loading
        $query = Kategori::withCount(['berita']);

        // Apply filtering jika ada dan field valid
        if (!empty($filters)) {
            foreach ($filters as $field => $value) {
                if (in_array($field, $validColumns)) {
                    $query->where($field, 'LIKE', "%$value%");
                }
            }
        }

        if (!empty($fixfilters)) {
            foreach ($fixfilters as $field => $value) {
                if (in_array($field, $validColumns)) {
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
        $kategori = $query->get();

        if($kategori->isEmpty()){        
            return response()->json([
                'success' => false,
                'pesan' => 'Data Kategori Kosong',
            ], 404);
            
            } else {
            return response()->json([
                'success' => true,
                'data' => $kategori,
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
            'kategori' => 'required|max:30|unique:kategori,kategori',
        ],[
            'kategori.required' => 'Kolom Kategori Wajib Diisi',
            'kategori.unique' => 'Kolom Kategori Sudah Ada',
            'kategori.max' => 'Kolom Kategori Maksimal 30',
        ]);

        // jika berhasil masukkan datanya ke database
        $kategoriBuat = Kategori::create($validate);

        if($kategoriBuat) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil ditambahkan',
                'data' => $kategoriBuat,
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
        $kategori = Kategori::with(['berita'])->find($id);

        if(is_null($kategori)){    
            return response()->json([
                'success' => false,
                'data' => 'Data Kategori Tidak Ditemukan',
            ], 404);
            
        } else {
            return response()->json([
                'success' => true,
                'data' => $kategori,
            ], 200);
        }
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
        $kategori = Kategori::find($id);
        if(is_null($kategori)){    
            return response()->json([
                'success' => false,
                'data' => 'Data Kategori Tidak Ditemukan',
            ], 404);
        }

        $validate = $request->validate([
            'kategori' => 'sometimes|required|max:30|unique:kategori,kategori,'.$id,
        ],[
            'kategori.required' => 'Kolom Kategori Wajib Diisi',
            'kategori.unique' => 'Kolom Kategori Sudah Ada',    
            'kategori.max' => 'Kolom Kategori Maksimal 30',
        ]);

        // jika berhasil masukkan datanya ke database
        $kategoriUpdate = $kategori->update($validate);

        if($kategoriUpdate) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil diedit',
                'data' => $kategori,
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
        $kategori = Kategori::find($id);

        if(is_null($kategori)){    
            return response()->json([
                'success' => true,
                'data' => 'Data Kategori Kosong',
            ], 404);
            
        }

         try {
            // hapus tags_Berita berdasarkan Berita yang dihapus
            $kategori->berita()->detach(); // Aktifkan ini jika harus menghapus kategori yang berelasi dengan Berita yang dihapus
            $deleteKategori = $kategori->delete();

        } catch(\Exception $e) {

            return response()->json([
                'success' => false, 
                'pesan' => 'Kategori gagal Dihapus Ada Yang Error '.$e->getMessage(),
            ], 400);
        }

        if($deleteKategori) {
            // Kembalikan response sukses
            return response()->json([
                'success' => true,
                'pesan' => 'Kategori Berhasil Dihapus',
            ], 200);
        } else {
            // Jika Kategori tidak ditemukan
            return response()->json([
                'success' => false, 
                'pesan' => 'Kategori Gagal Dihapus',
            ], 400);
        }
    }
}
