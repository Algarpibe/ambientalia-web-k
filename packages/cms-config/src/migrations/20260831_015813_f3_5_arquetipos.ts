import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_arquetipo" AS ENUM('producto', 'catalogo', 'software');
  CREATE TYPE "public"."enum_arquetipos_estado" AS ENUM('borrador', 'publicado');
  CREATE TABLE "arquetipos_blocks_texto_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_texto_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_texto_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_texto_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_texto_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_texto_arq_ritmo_pb_unidad767",
  	"contenido" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_icono_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_icono_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_icono_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_icono_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_icono_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_icono_arq_ritmo_pb_unidad767",
  	"titulo" varchar,
  	"contenido" varchar,
  	"imagen_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_imagen_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_imagen_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_imagen_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_imagen_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_imagen_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_imagen_arq_ritmo_pb_unidad767",
  	"imagen_id" integer NOT NULL,
  	"alt" varchar,
  	"enlace_label" varchar NOT NULL,
  	"enlace_href" varchar NOT NULL,
  	"enlace_external" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_boton_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_boton_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_boton_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_boton_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_boton_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_boton_arq_ritmo_pb_unidad767",
  	"texto" varchar NOT NULL,
  	"destino_label" varchar NOT NULL,
  	"destino_href" varchar NOT NULL,
  	"destino_external" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_slider_ancho_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_unidad767",
  	"contenido" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_video_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_video_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_video_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_video_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_video_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_video_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_video_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_video_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_video_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_video_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_video_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_video_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_video_arq_ritmo_pb_unidad767",
  	"url" varchar NOT NULL,
  	"portada_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_cta_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_cta_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_cta_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_cta_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_cta_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_cta_arq_ritmo_pb_unidad767",
  	"titulo" varchar,
  	"contenido" varchar,
  	"texto_boton" varchar,
  	"destino_label" varchar NOT NULL,
  	"destino_href" varchar NOT NULL,
  	"destino_external" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_tabla_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_tabla_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_tabla_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_tabla_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_tabla_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_tabla_arq_ritmo_pb_unidad767",
  	"contenido" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_galeria_arq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"imagen_id" integer NOT NULL,
  	"alt" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_galeria_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_galeria_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_galeria_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_galeria_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_galeria_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_galeria_arq_ritmo_pb_unidad767",
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_codigo_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_codigo_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_codigo_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_codigo_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_codigo_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_codigo_arq_ritmo_pb_unidad767",
  	"contenido" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_slider_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_slider_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_slider_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_slider_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_slider_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_slider_arq_ritmo_pb_unidad767",
  	"contenido" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "arquetipos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"arquetipo" "enum_arquetipos_arquetipo" NOT NULL,
  	"variante_corta" boolean DEFAULT false,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"estado" "enum_arquetipos_estado" DEFAULT 'borrador' NOT NULL,
  	"publicar_en" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "arquetipos_id" integer;
  ALTER TABLE "arquetipos_blocks_texto_arq" ADD CONSTRAINT "arquetipos_blocks_texto_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_icono_arq" ADD CONSTRAINT "arquetipos_blocks_icono_arq_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_icono_arq" ADD CONSTRAINT "arquetipos_blocks_icono_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_imagen_arq" ADD CONSTRAINT "arquetipos_blocks_imagen_arq_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_imagen_arq" ADD CONSTRAINT "arquetipos_blocks_imagen_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_boton_arq" ADD CONSTRAINT "arquetipos_blocks_boton_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_slider_ancho_arq" ADD CONSTRAINT "arquetipos_blocks_slider_ancho_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_video_arq" ADD CONSTRAINT "arquetipos_blocks_video_arq_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_video_arq" ADD CONSTRAINT "arquetipos_blocks_video_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_cta_arq" ADD CONSTRAINT "arquetipos_blocks_cta_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_tabla_arq" ADD CONSTRAINT "arquetipos_blocks_tabla_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_galeria_arq_items" ADD CONSTRAINT "arquetipos_blocks_galeria_arq_items_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_galeria_arq_items" ADD CONSTRAINT "arquetipos_blocks_galeria_arq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos_blocks_galeria_arq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_galeria_arq" ADD CONSTRAINT "arquetipos_blocks_galeria_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_codigo_arq" ADD CONSTRAINT "arquetipos_blocks_codigo_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_slider_arq" ADD CONSTRAINT "arquetipos_blocks_slider_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "arquetipos_blocks_texto_arq_order_idx" ON "arquetipos_blocks_texto_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_texto_arq_parent_id_idx" ON "arquetipos_blocks_texto_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_texto_arq_path_idx" ON "arquetipos_blocks_texto_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_icono_arq_order_idx" ON "arquetipos_blocks_icono_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_icono_arq_parent_id_idx" ON "arquetipos_blocks_icono_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_icono_arq_path_idx" ON "arquetipos_blocks_icono_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_icono_arq_imagen_idx" ON "arquetipos_blocks_icono_arq" USING btree ("imagen_id");
  CREATE INDEX "arquetipos_blocks_imagen_arq_order_idx" ON "arquetipos_blocks_imagen_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_imagen_arq_parent_id_idx" ON "arquetipos_blocks_imagen_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_imagen_arq_path_idx" ON "arquetipos_blocks_imagen_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_imagen_arq_imagen_idx" ON "arquetipos_blocks_imagen_arq" USING btree ("imagen_id");
  CREATE INDEX "arquetipos_blocks_boton_arq_order_idx" ON "arquetipos_blocks_boton_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_boton_arq_parent_id_idx" ON "arquetipos_blocks_boton_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_boton_arq_path_idx" ON "arquetipos_blocks_boton_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_slider_ancho_arq_order_idx" ON "arquetipos_blocks_slider_ancho_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_slider_ancho_arq_parent_id_idx" ON "arquetipos_blocks_slider_ancho_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_slider_ancho_arq_path_idx" ON "arquetipos_blocks_slider_ancho_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_video_arq_order_idx" ON "arquetipos_blocks_video_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_video_arq_parent_id_idx" ON "arquetipos_blocks_video_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_video_arq_path_idx" ON "arquetipos_blocks_video_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_video_arq_portada_idx" ON "arquetipos_blocks_video_arq" USING btree ("portada_id");
  CREATE INDEX "arquetipos_blocks_cta_arq_order_idx" ON "arquetipos_blocks_cta_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_cta_arq_parent_id_idx" ON "arquetipos_blocks_cta_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_cta_arq_path_idx" ON "arquetipos_blocks_cta_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_tabla_arq_order_idx" ON "arquetipos_blocks_tabla_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_tabla_arq_parent_id_idx" ON "arquetipos_blocks_tabla_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_tabla_arq_path_idx" ON "arquetipos_blocks_tabla_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_galeria_arq_items_order_idx" ON "arquetipos_blocks_galeria_arq_items" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_galeria_arq_items_parent_id_idx" ON "arquetipos_blocks_galeria_arq_items" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_galeria_arq_items_imagen_idx" ON "arquetipos_blocks_galeria_arq_items" USING btree ("imagen_id");
  CREATE INDEX "arquetipos_blocks_galeria_arq_order_idx" ON "arquetipos_blocks_galeria_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_galeria_arq_parent_id_idx" ON "arquetipos_blocks_galeria_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_galeria_arq_path_idx" ON "arquetipos_blocks_galeria_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_codigo_arq_order_idx" ON "arquetipos_blocks_codigo_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_codigo_arq_parent_id_idx" ON "arquetipos_blocks_codigo_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_codigo_arq_path_idx" ON "arquetipos_blocks_codigo_arq" USING btree ("_path");
  CREATE INDEX "arquetipos_blocks_slider_arq_order_idx" ON "arquetipos_blocks_slider_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_slider_arq_parent_id_idx" ON "arquetipos_blocks_slider_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_slider_arq_path_idx" ON "arquetipos_blocks_slider_arq" USING btree ("_path");
  CREATE UNIQUE INDEX "arquetipos_slug_idx" ON "arquetipos" USING btree ("slug");
  CREATE INDEX "arquetipos_estado_idx" ON "arquetipos" USING btree ("estado");
  CREATE INDEX "arquetipos_publicar_en_idx" ON "arquetipos" USING btree ("publicar_en");
  CREATE INDEX "arquetipos_updated_at_idx" ON "arquetipos" USING btree ("updated_at");
  CREATE INDEX "arquetipos_created_at_idx" ON "arquetipos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_arquetipos_fk" FOREIGN KEY ("arquetipos_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_arquetipos_id_idx" ON "payload_locked_documents_rels" USING btree ("arquetipos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "arquetipos_blocks_texto_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_icono_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_imagen_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_boton_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_slider_ancho_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_video_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_cta_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_tabla_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_galeria_arq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_galeria_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_codigo_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos_blocks_slider_arq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "arquetipos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "arquetipos_blocks_texto_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_icono_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_imagen_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_boton_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_slider_ancho_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_video_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_cta_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_tabla_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_galeria_arq_items" CASCADE;
  DROP TABLE "arquetipos_blocks_galeria_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_codigo_arq" CASCADE;
  DROP TABLE "arquetipos_blocks_slider_arq" CASCADE;
  DROP TABLE "arquetipos" CASCADE;
  -- ⚠ CORREGIDO A MANO (126.ª) — el \`down\` generado NO REVERTÍA, y §regla 30
  -- lo cazó en la única ventana en que se puede: ANTES de que entre el dato.
  --
  -- El generador emite las sentencias en este orden: primero
  -- \`DROP TABLE "arquetipos" CASCADE\`, después este \`DROP CONSTRAINT\`. Pero
  -- el CASCADE **ya se lleva por delante la FK** de \`payload_locked_documents_rels\`
  -- hacia \`arquetipos\`, así que cuando llega esta línea la constraint ya no
  -- existe y Postgres aborta la transacción entera:
  --
  --   error: constraint "payload_locked_documents_rels_arquetipos_fk"
  --          of relation "payload_locked_documents_rels" does not exist
  --
  -- Resultado sin el arreglo: \`migrate:down\` sale con exit 1 y **no revierte
  -- nada** — 13 tablas y 134 tipos se quedan puestos. \`IF EXISTS\` hace la
  -- sentencia idempotente sin cambiar lo que la reversa deja: la FK se va igual,
  -- por el CASCADE o por aquí.
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_arquetipos_fk";
  
  DROP INDEX "payload_locked_documents_rels_arquetipos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "arquetipos_id";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_texto_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_icono_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_imagen_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_boton_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_ancho_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_video_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_cta_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_tabla_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_galeria_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_codigo_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mb_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mt_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_mt_unidad767";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pb_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_arquetipos_blocks_slider_arq_ritmo_pb_unidad767";
  DROP TYPE "public"."enum_arquetipos_arquetipo";
  DROP TYPE "public"."enum_arquetipos_estado";`)
}
