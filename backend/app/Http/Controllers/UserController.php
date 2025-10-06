<?php

namespace App\Http\Controllers;


use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
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

        // Dapatkan daftar field yang valid dari tabel 'user'
        $validColumns = Schema::getColumnListing('users');

        // Validasi order (hanya ASC atau DESC)
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }

        // Validasi sort (jika tidak valid, gunakan default: created_at)
        if (!in_array($sort, $validColumns)) { 
            $sort = 'created_at';
        }

        // Query User dengan eager loading
        $query = User::with(['role']);

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
        $user = $query->get();

        if($user->isEmpty()){        
            return response()->json([
                'success' => false,
                'pesan' => 'Data User Kosong',
            ], 404);
            
            } else {
            return response()->json([
                'success' => true,
                'data' => $user,
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
            'name' => 'required|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:5',
            'role_id' => 'required|exists:roles,id',
            'profil' => 'sometimes|required|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ],[
            'name.required' => 'Kolom Name Wajib Diisi',
            'name.max' => 'Kolom Name Maksimal 50',
            'email.required' => 'Kolom Email Wajib Diisi',
            'email.email' => 'Kolom Email Harus Berupa Email', 
            'email.unique' => 'Kolom Email Sudah Ada',
            'password.required' => 'Kolom Password Wajib Diisi',
            'password.min' => 'Kolom Password Minimal 5',
            'role_id.required' => 'Kolom Role Wajib Diisi',
            'role_id.exists' => 'Kolom Role Tidak Valid',
            'profil.required' => 'Foto Profil Harus Diisi',
            'profil.image' => 'Foto Harus Berbentuk Image',
            'profil.mimes' => 'Foto Harus Berbentuk PNG, JPEG, JPG, GIF, WEBP',
            'profil.max' => 'Foto Dilarang Lebih Dari 2MB',
        ]);

        if($request->hasFile('profil')) {
            $file = $request->file('profil');
            $filename = time() .'_'. Str::random(5) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profil', $filename, 'public');
            $validate['profil'] = $filename;
        }

        // jika berhasil masukkan datanya ke database
        $userBuat = User::create($validate);

        if($userBuat) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil ditambahkan',
                'data' => $userBuat,
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
        $user = User::with(['role'])->find($id);

        if(is_null($user)){    
            return response()->json([
                'success' => false,
                'data' => 'Data User Tidak Ditemukan',
            ], 404);
            
        } else {
            return response()->json([
                'success' => true,
                'data' => $user,
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
        $user = User::find($id);
        if(is_null($user)){    
            return response()->json([
                'success' => false,
                'data' => 'Data User Tidak Ditemukan',
            ], 404);
        }

        $validate = $request->validate([
            'name' => 'sometimes|required|max:50',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'sometimes|required|min:5',
            'role_id' => 'sometimes|required|exists:roles,id',
            'profil' => 'sometimes|required|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ],[
            'name.required' => 'Kolom Name Wajib Diisi',
            'name.max' => 'Kolom Name Maksimal 50',
            'email.required' => 'Kolom Email Wajib Diisi',
            'email.email' => 'Kolom Email Harus Berupa Email', 
            'email.unique' => 'Kolom Email Sudah Ada',
            'password.required' => 'Kolom Password Wajib Diisi',
            'password.min' => 'Kolom Password Minimal 5',
            'role_id.required' => 'Kolom Role Wajib Diisi',
            'role_id.exists' => 'Kolom Role Tidak Valid',
            'profil.required' => 'Foto Profil Harus Diisi',
            'profil.image' => 'Foto Harus Berbentuk Image',
            'profil.mimes' => 'Foto Harus Berbentuk PNG, JPEG, JPG, GIF, WEBP',
            'profil.max' => 'Foto Dilarang Lebih Dari 2MB',
        ]);

        if($request->hasFile('profil')) {
            $file = $request->file('profil');
            if(!is_null($user->profil)) {
                Storage::disk('public')->delete('profil/'.$user->profil);
            }

            $filename = time() .'_'. Str::random(5) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profil', $filename, 'public');
            $validate['profil'] = $filename;
        }

        // jika berhasil masukkan datanya ke database
        $userUpdate = $user->update($validate);

        if($userUpdate) {
            // kirimkan pesan berhasil 
            return response()->json([
                'success' => true,
                'pesan' => 'Data Berhasil diedit',
                'data' => $user,
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
        $user = User::find($id);

        if(is_null($user)){    
            return response()->json([
                'success' => true,
                'data' => 'Data User Kosong',
            ], 404);
            
        }

         try {
            if(!is_null($user->profil)) {
                Storage::disk('public')->delete('profil/'.$user->profil);
            }
            
            $deleteUser = $user->delete();

        } catch(\Exception $e) {

            return response()->json([
                'success' => false, 
                'pesan' => 'User gagal Dihapus Ada Yang Error '.$e->getMessage(),
            ], 400);
        }

        if($deleteUser) {
            // Kembalikan response sukses
            return response()->json([
                'success' => true,
                'pesan' => 'User Berhasil Dihapus',
            ], 200);
        } else {
            // Jika Role tidak ditemukan
            return response()->json([
                'success' => false, 
                'pesan' => 'User Gagal Dihapus',
            ], 400);
        }
    }
}
