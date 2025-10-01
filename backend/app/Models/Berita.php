<?php

namespace App\Models;

use App\Models\User;
use App\Models\Kategori;
use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    public $table = 'berita';
    public $guarded = ['id', 'created_at', 'updated_at'];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kategori()
    {
        return $this->belongsToMany(Kategori::class, 'kategori_berita', 'berita_id', 'kategori_id');
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'like', 'berita_id', 'user_id');
    }
}
