<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public $table = 'roles';
    public $guarded = ['id', 'created_at', 'updated_at'];

    public function user()
    {
        return $this->hasMany(User::class, 'role_id', 'id');
    }
}
