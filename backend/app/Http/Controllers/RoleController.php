<?php

namespace App\Http\Controllers;


use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class RoleController extends Controller
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

        // Dapatkan daftar field yang valid dari tabel 'role'
        $validColumns = Schema::getColumnListing('role');

        // Validasi order (hanya ASC atau DESC)
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }

        // Validasi sort (jika tidak valid, gunakan default: created_at)
        if (!in_array($sort, $validColumns)) { 
            $sort = 'created_at';
        }

        // Query Role dengan eager loading
        $query = Role::withCount(['user']);

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
        $role = $query->get();

        if($role->isEmpty()){        
            return response()->json([
                'success' => false,
                'pesan' => 'Data Role Kosong',
            ], 404);
            
            } else {
            return response()->json([
                'success' => true,
                'data' => $role,
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
            'role' => 'required|unique:roles,role|max:30',
        ],[
            'role.required' => 'Kolom Role Wajib Diisi',
            'role.unique' => 'Kolom Role Sudah Ada',
            'role.max' => 'Kolom Role Maksimal 30',
        ]);

        // jika berhasil masukkan datanya ke database
        $roleBuat = Role::create($validate);

        if($roleBuat) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil ditambahkan',
                'data' => $roleBuat,
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
        $role = Role::with(['user'])->find($id);

        if(is_null($role)){    
            return response()->json([
                'success' => false,
                'data' => 'Data Role Tidak Ditemukan',
            ], 404);
            
        } else {
            return response()->json([
                'success' => true,
                'data' => $role,
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
        $role = Role::find($id);
        if(is_null($role)){    
            return response()->json([
                'success' => false,
                'data' => 'Data Role Tidak Ditemukan',
            ], 404);
        }

        $validate = $request->validate([
            'role' => 'sometimes|required|max:30|unique:roles,role,'.$id,
        ],[
            'role.required' => 'Kolom Role Wajib Diisi',
            'role.max' => 'Kolom Role Maksimal 30',
            'role.unique' => 'Kolom Role Sudah Ada',
        ]);

        // jika berhasil masukkan datanya ke database
        $roleUpdate = $role->update($validate);

        if($roleUpdate) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil diedit',
                'data' => $role,
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
        $role = Role::find($id);

        if(is_null($role)){    
            return response()->json([
                'success' => true,
                'data' => 'Data Role Kosong',
            ], 404);
            
        }

         try {
            // hapus tags_Berita berdasarkan Berita yang dihapus
            $deleteRole = $role->delete();

        } catch(\Exception $e) {

            return response()->json([
                'success' => false, 
                'pesan' => 'Role gagal Dihapus Ada Yang Error '.$e->getMessage(),
            ], 400);
        }

        if($deleteRole) {
            // Kembalikan response sukses
            return response()->json([
                'success' => true,
                'pesan' => 'Role Berhasil Dihapus',
            ], 200);
        } else {
            // Jika Role tidak ditemukan
            return response()->json([
                'success' => false, 
                'pesan' => 'Role Gagal Dihapus',
            ], 400);
        }
    }
}
