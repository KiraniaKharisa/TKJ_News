<?php

namespace App\Models;

use App\Models\Berita;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    public $table = 'kategori';
    public $guarded = ['id', 'created_at', 'updated_at'];

    public function berita()
    {
        return $this->belongsToMany(Berita::class, 'kategori_berita', 'kategori_id', 'berita_id');
    }
}
