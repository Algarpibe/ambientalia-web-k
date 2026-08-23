import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_piel" AS ENUM('defecto', 'azul');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_codigo_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_codigo_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_codigo_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_codigo_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_codigo_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_codigo_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_toggle_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_toggle_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_toggle_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_toggle_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_toggle_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_toggle_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_piel_align" AS ENUM('left', 'center', 'right', 'justify');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_reticula" AS ENUM('iconos', 'col-md-4', 'ninguna');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_alineacion" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_blurb_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_slider_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_slider_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_slider_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_slider_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_slider_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_slider_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_mapa_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_mapa_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_mapa_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_mapa_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_mapa_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_mapa_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_icono_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_icono_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_icono_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_icono_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_icono_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_blocks_icono_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_columnas_ancho" AS ENUM('1_4', '1_3', '2_5', '1_2', '3_5', '2_3', '3_4', '4_4');
  CREATE TYPE "public"."enum_paginas_bloques_filas_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_filas_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_bloques_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_paginas_estado" AS ENUM('borrador', 'publicado');
  CREATE TABLE "paginas_blocks_texto_pagina" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar NOT NULL,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_texto_pagina_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_texto_pagina_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_texto_pagina_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_texto_pagina_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_texto_pagina_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_texto_pagina_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_imagen_pagina" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"href" varchar,
  	"external" boolean,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_imagen_pagina_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_imagen_pagina_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_imagen_pagina_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_imagen_pagina_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_imagen_pagina_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_imagen_pagina_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_boton_pagina" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"piel" "enum_paginas_blocks_boton_pagina_piel" DEFAULT 'defecto',
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_boton_pagina_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_boton_pagina_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_boton_pagina_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_boton_pagina_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_boton_pagina_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_boton_pagina_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_codigo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar NOT NULL,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_codigo_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_codigo_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_codigo_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_codigo_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_codigo_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_codigo_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_toggle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel" numeric DEFAULT 5,
  	"cuerpo" varchar NOT NULL,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_toggle_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_toggle_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_toggle_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_toggle_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_toggle_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_toggle_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_video_pagina" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"embed_url" varchar NOT NULL,
  	"titulo" varchar,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_video_pagina_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_video_pagina_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_video_pagina_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_video_pagina_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_video_pagina_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_video_pagina_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_blurb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel" numeric DEFAULT 3,
  	"imagen_id" integer,
  	"alt" varchar,
  	"descripcion" varchar,
  	"piel_fs" numeric,
  	"piel_lh" numeric,
  	"piel_fw" numeric,
  	"piel_color" varchar,
  	"piel_align" "enum_paginas_blocks_blurb_piel_align",
  	"piel_movil_fs" numeric,
  	"reticula" "enum_paginas_blocks_blurb_reticula" DEFAULT 'iconos',
  	"alineacion" "enum_paginas_blocks_blurb_alineacion" DEFAULT 'center',
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_blurb_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_blurb_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_blurb_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_blurb_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_blurb_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_blurb_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_slider_completo_diapositivas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel" numeric DEFAULT 3,
  	"cuerpo" varchar,
  	"boton_label" varchar,
  	"boton_href" varchar,
  	"fondo_id" integer
  );
  
  CREATE TABLE "paginas_blocks_slider_completo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_slider_diapositivas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel" numeric DEFAULT 3,
  	"cuerpo" varchar,
  	"boton_label" varchar,
  	"boton_href" varchar,
  	"fondo_id" integer
  );
  
  CREATE TABLE "paginas_blocks_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_slider_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_slider_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_slider_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_slider_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_slider_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_slider_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_mapa_pines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar,
  	"lat" varchar,
  	"lng" varchar
  );
  
  CREATE TABLE "paginas_blocks_mapa" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_mapa_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_mapa_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_mapa_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_mapa_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_mapa_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_mapa_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_icono" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icono" varchar NOT NULL,
  	"texto" varchar,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_paginas_blocks_icono_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_paginas_blocks_icono_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_paginas_blocks_icono_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_paginas_blocks_icono_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_paginas_blocks_icono_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_paginas_blocks_icono_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_bloques_filas_columnas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ancho" "enum_paginas_bloques_filas_columnas_ancho" NOT NULL
  );
  
  CREATE TABLE "paginas_bloques_filas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pt_valor" numeric,
  	"pt_unidad" "enum_paginas_bloques_filas_pt_unidad",
  	"pt_movil_valor" numeric,
  	"pt_movil_unidad" "enum_paginas_bloques_filas_pt_movil_unidad",
  	"pb_valor" numeric,
  	"pb_unidad" "enum_paginas_bloques_filas_pb_unidad",
  	"pb_movil_valor" numeric,
  	"pb_movil_unidad" "enum_paginas_bloques_filas_pb_movil_unidad",
  	"mt_valor" numeric,
  	"mt_unidad" "enum_paginas_bloques_filas_mt_unidad",
  	"mt_movil_valor" numeric,
  	"mt_movil_unidad" "enum_paginas_bloques_filas_mt_movil_unidad",
  	"mb_valor" numeric,
  	"mb_unidad" "enum_paginas_bloques_filas_mb_unidad",
  	"mb_movil_valor" numeric,
  	"mb_movil_unidad" "enum_paginas_bloques_filas_mb_movil_unidad"
  );
  
  CREATE TABLE "paginas_bloques" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pt_valor" numeric,
  	"pt_unidad" "enum_paginas_bloques_pt_unidad",
  	"pt_movil_valor" numeric,
  	"pt_movil_unidad" "enum_paginas_bloques_pt_movil_unidad",
  	"pb_valor" numeric,
  	"pb_unidad" "enum_paginas_bloques_pb_unidad",
  	"pb_movil_valor" numeric,
  	"pb_movil_unidad" "enum_paginas_bloques_pb_movil_unidad"
  );
  
  CREATE TABLE "paginas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"prefijo" varchar,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"titulo" varchar NOT NULL,
  	"cuerpo_clasico" varchar,
  	"estado" "enum_paginas_estado" DEFAULT 'borrador' NOT NULL,
  	"publicar_en" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "paginas_id" integer;
  ALTER TABLE "paginas_blocks_texto_pagina" ADD CONSTRAINT "paginas_blocks_texto_pagina_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_imagen_pagina" ADD CONSTRAINT "paginas_blocks_imagen_pagina_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paginas_blocks_imagen_pagina" ADD CONSTRAINT "paginas_blocks_imagen_pagina_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_boton_pagina" ADD CONSTRAINT "paginas_blocks_boton_pagina_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_codigo" ADD CONSTRAINT "paginas_blocks_codigo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_toggle" ADD CONSTRAINT "paginas_blocks_toggle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_video_pagina" ADD CONSTRAINT "paginas_blocks_video_pagina_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_blurb" ADD CONSTRAINT "paginas_blocks_blurb_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paginas_blocks_blurb" ADD CONSTRAINT "paginas_blocks_blurb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_slider_completo_diapositivas" ADD CONSTRAINT "paginas_blocks_slider_completo_diapositivas_fondo_id_media_id_fk" FOREIGN KEY ("fondo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paginas_blocks_slider_completo_diapositivas" ADD CONSTRAINT "paginas_blocks_slider_completo_diapositivas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_slider_completo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_slider_completo" ADD CONSTRAINT "paginas_blocks_slider_completo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_slider_diapositivas" ADD CONSTRAINT "paginas_blocks_slider_diapositivas_fondo_id_media_id_fk" FOREIGN KEY ("fondo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paginas_blocks_slider_diapositivas" ADD CONSTRAINT "paginas_blocks_slider_diapositivas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_slider" ADD CONSTRAINT "paginas_blocks_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_mapa_pines" ADD CONSTRAINT "paginas_blocks_mapa_pines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_mapa"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_mapa" ADD CONSTRAINT "paginas_blocks_mapa_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_icono" ADD CONSTRAINT "paginas_blocks_icono_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_bloques_filas_columnas" ADD CONSTRAINT "paginas_bloques_filas_columnas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_bloques_filas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_bloques_filas" ADD CONSTRAINT "paginas_bloques_filas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_bloques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_bloques" ADD CONSTRAINT "paginas_bloques_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "paginas_blocks_texto_pagina_order_idx" ON "paginas_blocks_texto_pagina" USING btree ("_order");
  CREATE INDEX "paginas_blocks_texto_pagina_parent_id_idx" ON "paginas_blocks_texto_pagina" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_texto_pagina_path_idx" ON "paginas_blocks_texto_pagina" USING btree ("_path");
  CREATE INDEX "paginas_blocks_imagen_pagina_order_idx" ON "paginas_blocks_imagen_pagina" USING btree ("_order");
  CREATE INDEX "paginas_blocks_imagen_pagina_parent_id_idx" ON "paginas_blocks_imagen_pagina" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_imagen_pagina_path_idx" ON "paginas_blocks_imagen_pagina" USING btree ("_path");
  CREATE INDEX "paginas_blocks_imagen_pagina_src_idx" ON "paginas_blocks_imagen_pagina" USING btree ("src_id");
  CREATE INDEX "paginas_blocks_boton_pagina_order_idx" ON "paginas_blocks_boton_pagina" USING btree ("_order");
  CREATE INDEX "paginas_blocks_boton_pagina_parent_id_idx" ON "paginas_blocks_boton_pagina" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_boton_pagina_path_idx" ON "paginas_blocks_boton_pagina" USING btree ("_path");
  CREATE INDEX "paginas_blocks_codigo_order_idx" ON "paginas_blocks_codigo" USING btree ("_order");
  CREATE INDEX "paginas_blocks_codigo_parent_id_idx" ON "paginas_blocks_codigo" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_codigo_path_idx" ON "paginas_blocks_codigo" USING btree ("_path");
  CREATE INDEX "paginas_blocks_toggle_order_idx" ON "paginas_blocks_toggle" USING btree ("_order");
  CREATE INDEX "paginas_blocks_toggle_parent_id_idx" ON "paginas_blocks_toggle" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_toggle_path_idx" ON "paginas_blocks_toggle" USING btree ("_path");
  CREATE INDEX "paginas_blocks_video_pagina_order_idx" ON "paginas_blocks_video_pagina" USING btree ("_order");
  CREATE INDEX "paginas_blocks_video_pagina_parent_id_idx" ON "paginas_blocks_video_pagina" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_video_pagina_path_idx" ON "paginas_blocks_video_pagina" USING btree ("_path");
  CREATE INDEX "paginas_blocks_blurb_order_idx" ON "paginas_blocks_blurb" USING btree ("_order");
  CREATE INDEX "paginas_blocks_blurb_parent_id_idx" ON "paginas_blocks_blurb" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_blurb_path_idx" ON "paginas_blocks_blurb" USING btree ("_path");
  CREATE INDEX "paginas_blocks_blurb_imagen_idx" ON "paginas_blocks_blurb" USING btree ("imagen_id");
  CREATE INDEX "paginas_blocks_slider_completo_diapositivas_order_idx" ON "paginas_blocks_slider_completo_diapositivas" USING btree ("_order");
  CREATE INDEX "paginas_blocks_slider_completo_diapositivas_parent_id_idx" ON "paginas_blocks_slider_completo_diapositivas" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_slider_completo_diapositivas_fondo_idx" ON "paginas_blocks_slider_completo_diapositivas" USING btree ("fondo_id");
  CREATE INDEX "paginas_blocks_slider_completo_order_idx" ON "paginas_blocks_slider_completo" USING btree ("_order");
  CREATE INDEX "paginas_blocks_slider_completo_parent_id_idx" ON "paginas_blocks_slider_completo" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_slider_completo_path_idx" ON "paginas_blocks_slider_completo" USING btree ("_path");
  CREATE INDEX "paginas_blocks_slider_diapositivas_order_idx" ON "paginas_blocks_slider_diapositivas" USING btree ("_order");
  CREATE INDEX "paginas_blocks_slider_diapositivas_parent_id_idx" ON "paginas_blocks_slider_diapositivas" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_slider_diapositivas_fondo_idx" ON "paginas_blocks_slider_diapositivas" USING btree ("fondo_id");
  CREATE INDEX "paginas_blocks_slider_order_idx" ON "paginas_blocks_slider" USING btree ("_order");
  CREATE INDEX "paginas_blocks_slider_parent_id_idx" ON "paginas_blocks_slider" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_slider_path_idx" ON "paginas_blocks_slider" USING btree ("_path");
  CREATE INDEX "paginas_blocks_mapa_pines_order_idx" ON "paginas_blocks_mapa_pines" USING btree ("_order");
  CREATE INDEX "paginas_blocks_mapa_pines_parent_id_idx" ON "paginas_blocks_mapa_pines" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_mapa_order_idx" ON "paginas_blocks_mapa" USING btree ("_order");
  CREATE INDEX "paginas_blocks_mapa_parent_id_idx" ON "paginas_blocks_mapa" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_mapa_path_idx" ON "paginas_blocks_mapa" USING btree ("_path");
  CREATE INDEX "paginas_blocks_icono_order_idx" ON "paginas_blocks_icono" USING btree ("_order");
  CREATE INDEX "paginas_blocks_icono_parent_id_idx" ON "paginas_blocks_icono" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_icono_path_idx" ON "paginas_blocks_icono" USING btree ("_path");
  CREATE INDEX "paginas_bloques_filas_columnas_order_idx" ON "paginas_bloques_filas_columnas" USING btree ("_order");
  CREATE INDEX "paginas_bloques_filas_columnas_parent_id_idx" ON "paginas_bloques_filas_columnas" USING btree ("_parent_id");
  CREATE INDEX "paginas_bloques_filas_order_idx" ON "paginas_bloques_filas" USING btree ("_order");
  CREATE INDEX "paginas_bloques_filas_parent_id_idx" ON "paginas_bloques_filas" USING btree ("_parent_id");
  CREATE INDEX "paginas_bloques_order_idx" ON "paginas_bloques" USING btree ("_order");
  CREATE INDEX "paginas_bloques_parent_id_idx" ON "paginas_bloques" USING btree ("_parent_id");
  CREATE INDEX "paginas_slug_idx" ON "paginas" USING btree ("slug");
  CREATE INDEX "paginas_estado_idx" ON "paginas" USING btree ("estado");
  CREATE INDEX "paginas_publicar_en_idx" ON "paginas" USING btree ("publicar_en");
  CREATE INDEX "paginas_updated_at_idx" ON "paginas" USING btree ("updated_at");
  CREATE INDEX "paginas_created_at_idx" ON "paginas" USING btree ("created_at");
  CREATE UNIQUE INDEX "prefijo_slug_idx" ON "paginas" USING btree ("prefijo","slug");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paginas_fk" FOREIGN KEY ("paginas_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_paginas_id_idx" ON "payload_locked_documents_rels" USING btree ("paginas_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "paginas_blocks_texto_pagina" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_imagen_pagina" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_boton_pagina" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_codigo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_toggle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_video_pagina" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_blurb" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_slider_completo_diapositivas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_slider_completo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_slider_diapositivas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_mapa_pines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_mapa" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_blocks_icono" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_bloques_filas_columnas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_bloques_filas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas_bloques" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paginas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "paginas_blocks_texto_pagina" CASCADE;
  DROP TABLE "paginas_blocks_imagen_pagina" CASCADE;
  DROP TABLE "paginas_blocks_boton_pagina" CASCADE;
  DROP TABLE "paginas_blocks_codigo" CASCADE;
  DROP TABLE "paginas_blocks_toggle" CASCADE;
  DROP TABLE "paginas_blocks_video_pagina" CASCADE;
  DROP TABLE "paginas_blocks_blurb" CASCADE;
  DROP TABLE "paginas_blocks_slider_completo_diapositivas" CASCADE;
  DROP TABLE "paginas_blocks_slider_completo" CASCADE;
  DROP TABLE "paginas_blocks_slider_diapositivas" CASCADE;
  DROP TABLE "paginas_blocks_slider" CASCADE;
  DROP TABLE "paginas_blocks_mapa_pines" CASCADE;
  DROP TABLE "paginas_blocks_mapa" CASCADE;
  DROP TABLE "paginas_blocks_icono" CASCADE;
  DROP TABLE "paginas_bloques_filas_columnas" CASCADE;
  DROP TABLE "paginas_bloques_filas" CASCADE;
  DROP TABLE "paginas_bloques" CASCADE;
  DROP TABLE "paginas" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_paginas_fk";
  
  DROP INDEX "payload_locked_documents_rels_paginas_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "paginas_id";
  DROP TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_texto_pagina_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_imagen_pagina_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_piel";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_boton_pagina_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_codigo_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_codigo_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_codigo_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_codigo_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_codigo_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_codigo_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_toggle_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_toggle_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_toggle_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_toggle_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_toggle_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_toggle_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_video_pagina_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_blurb_piel_align";
  DROP TYPE "public"."enum_paginas_blocks_blurb_reticula";
  DROP TYPE "public"."enum_paginas_blocks_blurb_alineacion";
  DROP TYPE "public"."enum_paginas_blocks_blurb_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_blurb_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_blurb_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_blurb_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_blurb_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_blurb_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_slider_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_slider_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_slider_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_slider_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_slider_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_slider_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_mapa_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_mapa_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_mapa_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_mapa_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_mapa_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_mapa_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_icono_ritmo_mt_unidad";
  DROP TYPE "public"."enum_paginas_blocks_icono_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_icono_ritmo_mb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_icono_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_blocks_icono_ritmo_pb_unidad";
  DROP TYPE "public"."enum_paginas_blocks_icono_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_columnas_ancho";
  DROP TYPE "public"."enum_paginas_bloques_filas_pt_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_pt_movil_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_pb_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_mt_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_mt_movil_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_mb_unidad";
  DROP TYPE "public"."enum_paginas_bloques_filas_mb_movil_unidad";
  DROP TYPE "public"."enum_paginas_bloques_pt_unidad";
  DROP TYPE "public"."enum_paginas_bloques_pt_movil_unidad";
  DROP TYPE "public"."enum_paginas_bloques_pb_unidad";
  DROP TYPE "public"."enum_paginas_bloques_pb_movil_unidad";
  DROP TYPE "public"."enum_paginas_estado";`)
}
