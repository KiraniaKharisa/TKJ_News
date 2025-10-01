<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kategori_berita', function (Blueprint $table) {
            $table->foreignId('kategori_id')->references('id')->on('kategori')->onDelete('cascade');
            $table->foreignId('berita_id')->references('id')->on('berita')->onDelete('cascade');
            $table->primary(['kategori_id', 'berita_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pivot_table_kategori_on_berita');
    }
};
