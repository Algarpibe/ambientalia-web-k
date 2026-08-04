import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sectores_blocks_cta_descarga_variante" AS ENUM('foto', 'fondo');
  CREATE TYPE "public"."enum_sectores_blocks_cta_descarga_flujo" AS ENUM('seccion', 'seccionRasa', 'fila', 'filaPegada');
  CREATE TYPE "public"."enum_sectores_blocks_beneficios_aplicaciones_flujo" AS ENUM('seccion', 'seccionRasa', 'fila', 'filaPegada');
  CREATE TYPE "public"."enum_sectores_blocks_claim_con_foto_flujo" AS ENUM('seccion', 'seccionRasa', 'fila', 'filaPegada');
  CREATE TYPE "public"."enum_sectores_blocks_lista_simple2_col_flujo" AS ENUM('seccion', 'seccionRasa', 'fila', 'filaPegada');
  CREATE TYPE "public"."enum_sectores_blocks_mapa_proyectos_flujo" AS ENUM('seccion', 'seccionRasa', 'fila', 'filaPegada');
  CREATE TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho" AS ENUM('1_4', '1_3', '2_5', '1_2', '3_5', '2_3', '3_4', '4_4');
  CREATE TYPE "public"."enum_productos_tipo" AS ENUM('ficha', 'catalogo');
  CREATE TYPE "public"."enum_productos_padre" AS ENUM('cartuchos-inteligentes', 'sensor-de-calidad-del-aire');
  CREATE TYPE "public"."enum_casos_prefijo" AS ENUM('casos-de-exito', 'case-studies');
  CREATE TYPE "public"."enum_documentos_cientificos_prefijo" AS ENUM('documentos-cientificos', 'estudios-cientificos');
  CREATE TABLE "sectores_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "sectores_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean
  );
  
  CREATE TABLE "sectores_hero_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_cta_descarga_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_cta_descarga" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"cta_external" boolean,
  	"image_id" integer,
  	"variante" "enum_sectores_blocks_cta_descarga_variante" DEFAULT 'foto',
  	"flujo" "enum_sectores_blocks_cta_descarga_flujo" DEFAULT 'seccion',
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectores_blocks_beneficios_aplicaciones_left_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_beneficios_aplicaciones_right_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_beneficios_aplicaciones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_title" varchar NOT NULL,
  	"right_title" varchar NOT NULL,
  	"flujo" "enum_sectores_blocks_beneficios_aplicaciones_flujo" DEFAULT 'seccion',
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectores_blocks_claim_con_foto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar NOT NULL,
  	"image_src_id" integer NOT NULL,
  	"image_alt" varchar,
  	"flujo" "enum_sectores_blocks_claim_con_foto_flujo" DEFAULT 'seccion',
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectores_blocks_lista_simple2_col_left" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_lista_simple2_col_right" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_lista_simple2_col" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"flujo" "enum_sectores_blocks_lista_simple2_col_flujo" DEFAULT 'seccion',
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectores_blocks_mapa_proyectos_pins" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lat" numeric NOT NULL,
  	"lng" numeric NOT NULL
  );
  
  CREATE TABLE "sectores_blocks_mapa_proyectos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"flujo" "enum_sectores_blocks_mapa_proyectos_flujo" DEFAULT 'seccion',
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectores_cta_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"cta_external" boolean,
  	"image_id" integer
  );
  
  CREATE TABLE "sectores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"seo_canonical" varchar,
  	"header_kicker" varchar NOT NULL,
  	"header_title" varchar NOT NULL,
  	"header_image_id" integer NOT NULL,
  	"hero_image_src_id" integer NOT NULL,
  	"hero_image_alt" varchar,
  	"hero_heading" varchar NOT NULL,
  	"hero_heading_color" varchar DEFAULT '#0075c9',
  	"proyectos_title" varchar NOT NULL,
  	"proyectos_cta_label" varchar NOT NULL,
  	"proyectos_cta_href" varchar NOT NULL,
  	"proyectos_cta_external" boolean,
  	"articulos_title" varchar NOT NULL,
  	"articulos_cta_label" varchar NOT NULL,
  	"articulos_cta_href" varchar NOT NULL,
  	"articulos_cta_external" boolean,
  	"taxonomy_label" varchar NOT NULL,
  	"taxonomy_href" varchar NOT NULL,
  	"taxonomy_external" boolean,
  	"footer_strip_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sectores_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"productos_id" integer,
  	"casos_id" integer,
  	"entradas_blog_id" integer
  );
  
  CREATE TABLE "monograficos_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "monograficos_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean
  );
  
  CREATE TABLE "monograficos_hero_modulos_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "monograficos_hero_modulos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"heading_color" varchar,
  	"mb" numeric
  );
  
  CREATE TABLE "monograficos_blocks_titular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_claim" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_p" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"p" jsonb NOT NULL,
  	"pb" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_ul_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" jsonb NOT NULL
  );
  
  CREATE TABLE "monograficos_blocks_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_claim_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_titular_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titular" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lh" numeric DEFAULT 30.6,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_imagen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_boton" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_serie_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "monograficos_blocks_serie" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_tabla_cabeceras" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "monograficos_blocks_tabla_filas_celdas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"fuerte" varchar,
  	"resto" varchar
  );
  
  CREATE TABLE "monograficos_blocks_tabla_filas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "monograficos_blocks_tabla" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_cta_descarga_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "monograficos_blocks_cta_descarga" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"cta_external" boolean,
  	"image_id" integer,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_blocks_mapa_proyectos_pins" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lat" numeric NOT NULL,
  	"lng" numeric NOT NULL
  );
  
  CREATE TABLE "monograficos_blocks_mapa_proyectos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "monograficos_cuerpo_filas_columnas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ancho" "enum_monograficos_cuerpo_filas_columnas_ancho" NOT NULL,
  	"punteado" boolean,
  	"mb_movil" numeric
  );
  
  CREATE TABLE "monograficos_cuerpo_filas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mt" numeric,
  	"pt" numeric,
  	"pb" numeric
  );
  
  CREATE TABLE "monograficos_cuerpo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mt" numeric,
  	"pt" numeric,
  	"pb" numeric
  );
  
  CREATE TABLE "monograficos_cta_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"cta_external" boolean,
  	"image_id" integer
  );
  
  CREATE TABLE "monograficos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"seo_canonical" varchar,
  	"header_kicker" varchar NOT NULL,
  	"header_title" varchar NOT NULL,
  	"header_image_id" integer NOT NULL,
  	"hero_image_src_id" integer NOT NULL,
  	"hero_image_alt" varchar,
  	"hero_pb" numeric,
  	"proyectos_title" varchar NOT NULL,
  	"proyectos_cta_label" varchar NOT NULL,
  	"proyectos_cta_href" varchar NOT NULL,
  	"proyectos_cta_external" boolean,
  	"articulos_title" varchar NOT NULL,
  	"articulos_cta_label" varchar NOT NULL,
  	"articulos_cta_href" varchar NOT NULL,
  	"articulos_cta_external" boolean,
  	"taxonomy_label" varchar NOT NULL,
  	"taxonomy_href" varchar NOT NULL,
  	"taxonomy_external" boolean,
  	"footer_strip_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "monograficos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"productos_id" integer,
  	"casos_id" integer,
  	"entradas_blog_id" integer
  );
  
  CREATE TABLE "productos_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "productos_blocks_titular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_claim" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_p" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"p" jsonb NOT NULL,
  	"pb" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_ul_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" jsonb NOT NULL
  );
  
  CREATE TABLE "productos_blocks_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_claim_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_titular_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titular" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lh" numeric DEFAULT 30.6,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_imagen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_boton" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_toggle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"contenido" varchar,
  	"abierto_por_defecto" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_blurb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"texto" varchar,
  	"icono_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_slider_diapositivas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"texto" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_external" boolean
  );
  
  CREATE TABLE "productos_blocks_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_gallery_imagenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar
  );
  
  CREATE TABLE "productos_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"archivo_id" integer,
  	"url" varchar,
  	"poster_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_cta_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "productos_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_href" varchar NOT NULL,
  	"cta_external" boolean,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos_blocks_table_cabeceras" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "productos_blocks_table_filas_celdas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"fuerte" varchar,
  	"resto" varchar
  );
  
  CREATE TABLE "productos_blocks_table_filas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "productos_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "productos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"tipo" "enum_productos_tipo" DEFAULT 'ficha',
  	"padre" "enum_productos_padre",
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"highlight" varchar,
  	"bullets_titulo" varchar DEFAULT 'Ventajas',
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "casos_galeria" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"width" numeric,
  	"height" numeric
  );
  
  CREATE TABLE "casos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"prefijo" "enum_casos_prefijo" DEFAULT 'casos-de-exito',
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"titulo" varchar NOT NULL,
  	"imagen_cabecera_id" integer NOT NULL,
  	"cliente" varchar NOT NULL,
  	"necesidad" varchar NOT NULL,
  	"solucion" varchar NOT NULL,
  	"resultados" varchar NOT NULL,
  	"destacado" varchar,
  	"detalles_usuario" varchar NOT NULL,
  	"detalles_ubicacion" varchar NOT NULL,
  	"detalles_anyo" varchar NOT NULL,
  	"detalles_parametros" varchar,
  	"ubicacion_mapa_lat" numeric,
  	"ubicacion_mapa_lng" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "casos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"taxonomia_sectores_id" integer,
  	"productos_id" integer
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"cuerpo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "taxonomia_sectores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"nombre" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "taxonomia_sectores_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sectores_id" integer,
  	"monograficos_id" integer
  );
  
  CREATE TABLE "entradas_blog" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"titulo" varchar NOT NULL,
  	"fecha_publicacion" varchar NOT NULL,
  	"fecha_actualizacion" varchar,
  	"imagen_destacada_src_id" integer,
  	"imagen_destacada_srcset" varchar,
  	"imagen_destacada_sizes" varchar,
  	"imagen_destacada_width" varchar,
  	"imagen_destacada_height" varchar,
  	"imagen_destacada_alt" varchar,
  	"extracto" varchar,
  	"recurso_id" integer,
  	"cuerpo" varchar NOT NULL,
  	"relacionados" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entradas_blog_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer,
  	"etiquetas_id" integer
  );
  
  CREATE TABLE "terminos_kunakpedia" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"titulo" varchar NOT NULL,
  	"titulo_miga" varchar DEFAULT null,
  	"cuerpo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documentos_cientificos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"prefijo" "enum_documentos_cientificos_prefijo" DEFAULT 'documentos-cientificos',
  	"categoria_id" integer NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"titulo" varchar NOT NULL,
  	"autores" varchar NOT NULL,
  	"anyo" varchar NOT NULL,
  	"portada_src_id" integer NOT NULL,
  	"portada_srcset" varchar,
  	"portada_sizes" varchar,
  	"portada_width" varchar,
  	"portada_height" varchar,
  	"portada_alt" varchar,
  	"descarga_href" varchar NOT NULL,
  	"descarga_label" varchar NOT NULL,
  	"cuerpo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articulos_kb_blocks_titular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_claim" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_p" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"p" jsonb NOT NULL,
  	"pb" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_ul_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" jsonb NOT NULL
  );
  
  CREATE TABLE "articulos_kb_blocks_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_claim_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_titular_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titular" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lh" numeric DEFAULT 30.6,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_imagen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_boton" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar,
  	"seo_og_image" varchar,
  	"titulo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "etiquetas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_recursos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"padre_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_cientificas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_sm_url" varchar,
  	"sizes_sm_width" numeric,
  	"sizes_sm_height" numeric,
  	"sizes_sm_mime_type" varchar,
  	"sizes_sm_filesize" numeric,
  	"sizes_sm_filename" varchar,
  	"sizes_md_url" varchar,
  	"sizes_md_width" numeric,
  	"sizes_md_height" numeric,
  	"sizes_md_mime_type" varchar,
  	"sizes_md_filesize" numeric,
  	"sizes_md_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_card_wide_url" varchar,
  	"sizes_card_wide_width" numeric,
  	"sizes_card_wide_height" numeric,
  	"sizes_card_wide_mime_type" varchar,
  	"sizes_card_wide_filesize" numeric,
  	"sizes_card_wide_filename" varchar,
  	"sizes_lg_url" varchar,
  	"sizes_lg_width" numeric,
  	"sizes_lg_height" numeric,
  	"sizes_lg_mime_type" varchar,
  	"sizes_lg_filesize" numeric,
  	"sizes_lg_filename" varchar
  );
  
  CREATE TABLE "usuarios_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sectores_id" integer,
  	"monograficos_id" integer,
  	"productos_id" integer,
  	"casos_id" integer,
  	"faqs_id" integer,
  	"taxonomia_sectores_id" integer,
  	"entradas_blog_id" integer,
  	"terminos_kunakpedia_id" integer,
  	"documentos_cientificos_id" integer,
  	"articulos_kb_id" integer,
  	"categorias_id" integer,
  	"etiquetas_id" integer,
  	"categorias_recursos_id" integer,
  	"categorias_cientificas_id" integer,
  	"media_id" integer,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "sectores_breadcrumb" ADD CONSTRAINT "sectores_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_hero_ctas" ADD CONSTRAINT "sectores_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_hero_paragraphs" ADD CONSTRAINT "sectores_hero_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_cta_descarga_body" ADD CONSTRAINT "sectores_blocks_cta_descarga_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores_blocks_cta_descarga"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_cta_descarga" ADD CONSTRAINT "sectores_blocks_cta_descarga_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores_blocks_cta_descarga" ADD CONSTRAINT "sectores_blocks_cta_descarga_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_beneficios_aplicaciones_left_items" ADD CONSTRAINT "sectores_blocks_beneficios_aplicaciones_left_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores_blocks_beneficios_aplicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_beneficios_aplicaciones_right_items" ADD CONSTRAINT "sectores_blocks_beneficios_aplicaciones_right_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores_blocks_beneficios_aplicaciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_beneficios_aplicaciones" ADD CONSTRAINT "sectores_blocks_beneficios_aplicaciones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_claim_con_foto" ADD CONSTRAINT "sectores_blocks_claim_con_foto_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores_blocks_claim_con_foto" ADD CONSTRAINT "sectores_blocks_claim_con_foto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_lista_simple2_col_left" ADD CONSTRAINT "sectores_blocks_lista_simple2_col_left_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores_blocks_lista_simple2_col"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_lista_simple2_col_right" ADD CONSTRAINT "sectores_blocks_lista_simple2_col_right_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores_blocks_lista_simple2_col"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_lista_simple2_col" ADD CONSTRAINT "sectores_blocks_lista_simple2_col_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_mapa_proyectos_pins" ADD CONSTRAINT "sectores_blocks_mapa_proyectos_pins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores_blocks_mapa_proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_blocks_mapa_proyectos" ADD CONSTRAINT "sectores_blocks_mapa_proyectos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_cta_slides" ADD CONSTRAINT "sectores_cta_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores_cta_slides" ADD CONSTRAINT "sectores_cta_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores" ADD CONSTRAINT "sectores_header_image_id_media_id_fk" FOREIGN KEY ("header_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores" ADD CONSTRAINT "sectores_hero_image_src_id_media_id_fk" FOREIGN KEY ("hero_image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores" ADD CONSTRAINT "sectores_footer_strip_image_id_media_id_fk" FOREIGN KEY ("footer_strip_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores_rels" ADD CONSTRAINT "sectores_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_rels" ADD CONSTRAINT "sectores_rels_productos_fk" FOREIGN KEY ("productos_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_rels" ADD CONSTRAINT "sectores_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_rels" ADD CONSTRAINT "sectores_rels_entradas_blog_fk" FOREIGN KEY ("entradas_blog_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_breadcrumb" ADD CONSTRAINT "monograficos_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_hero_ctas" ADD CONSTRAINT "monograficos_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_hero_modulos_paragraphs" ADD CONSTRAINT "monograficos_hero_modulos_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_hero_modulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_hero_modulos" ADD CONSTRAINT "monograficos_hero_modulos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_titular" ADD CONSTRAINT "monograficos_blocks_titular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_claim" ADD CONSTRAINT "monograficos_blocks_claim_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_p" ADD CONSTRAINT "monograficos_blocks_p_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_ul_ul" ADD CONSTRAINT "monograficos_blocks_ul_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_ul"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_ul" ADD CONSTRAINT "monograficos_blocks_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_claim_2" ADD CONSTRAINT "monograficos_blocks_claim_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_titular_2" ADD CONSTRAINT "monograficos_blocks_titular_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_texto" ADD CONSTRAINT "monograficos_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_imagen" ADD CONSTRAINT "monograficos_blocks_imagen_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_imagen" ADD CONSTRAINT "monograficos_blocks_imagen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_boton" ADD CONSTRAINT "monograficos_blocks_boton_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_serie_items" ADD CONSTRAINT "monograficos_blocks_serie_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_serie"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_serie" ADD CONSTRAINT "monograficos_blocks_serie_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_tabla_cabeceras" ADD CONSTRAINT "monograficos_blocks_tabla_cabeceras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_tabla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_tabla_filas_celdas" ADD CONSTRAINT "monograficos_blocks_tabla_filas_celdas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_tabla_filas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_tabla_filas" ADD CONSTRAINT "monograficos_blocks_tabla_filas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_tabla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_tabla" ADD CONSTRAINT "monograficos_blocks_tabla_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_cta_descarga_body" ADD CONSTRAINT "monograficos_blocks_cta_descarga_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_cta_descarga"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_cta_descarga" ADD CONSTRAINT "monograficos_blocks_cta_descarga_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_cta_descarga" ADD CONSTRAINT "monograficos_blocks_cta_descarga_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_mapa_proyectos_pins" ADD CONSTRAINT "monograficos_blocks_mapa_proyectos_pins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_mapa_proyectos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_blocks_mapa_proyectos" ADD CONSTRAINT "monograficos_blocks_mapa_proyectos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_cuerpo_filas_columnas" ADD CONSTRAINT "monograficos_cuerpo_filas_columnas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_cuerpo_filas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_cuerpo_filas" ADD CONSTRAINT "monograficos_cuerpo_filas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_cuerpo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_cuerpo" ADD CONSTRAINT "monograficos_cuerpo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_cta_slides" ADD CONSTRAINT "monograficos_cta_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos_cta_slides" ADD CONSTRAINT "monograficos_cta_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos" ADD CONSTRAINT "monograficos_header_image_id_media_id_fk" FOREIGN KEY ("header_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos" ADD CONSTRAINT "monograficos_hero_image_src_id_media_id_fk" FOREIGN KEY ("hero_image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos" ADD CONSTRAINT "monograficos_footer_strip_image_id_media_id_fk" FOREIGN KEY ("footer_strip_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos_rels" ADD CONSTRAINT "monograficos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_rels" ADD CONSTRAINT "monograficos_rels_productos_fk" FOREIGN KEY ("productos_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_rels" ADD CONSTRAINT "monograficos_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_rels" ADD CONSTRAINT "monograficos_rels_entradas_blog_fk" FOREIGN KEY ("entradas_blog_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_bullets" ADD CONSTRAINT "productos_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_titular" ADD CONSTRAINT "productos_blocks_titular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_claim" ADD CONSTRAINT "productos_blocks_claim_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_p" ADD CONSTRAINT "productos_blocks_p_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_ul_ul" ADD CONSTRAINT "productos_blocks_ul_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_ul"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_ul" ADD CONSTRAINT "productos_blocks_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_claim_2" ADD CONSTRAINT "productos_blocks_claim_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_titular_2" ADD CONSTRAINT "productos_blocks_titular_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_texto" ADD CONSTRAINT "productos_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_imagen" ADD CONSTRAINT "productos_blocks_imagen_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_imagen" ADD CONSTRAINT "productos_blocks_imagen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_boton" ADD CONSTRAINT "productos_blocks_boton_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_toggle" ADD CONSTRAINT "productos_blocks_toggle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_blurb" ADD CONSTRAINT "productos_blocks_blurb_icono_id_media_id_fk" FOREIGN KEY ("icono_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_blurb" ADD CONSTRAINT "productos_blocks_blurb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_slider_diapositivas" ADD CONSTRAINT "productos_blocks_slider_diapositivas_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_slider_diapositivas" ADD CONSTRAINT "productos_blocks_slider_diapositivas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_slider" ADD CONSTRAINT "productos_blocks_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_gallery_imagenes" ADD CONSTRAINT "productos_blocks_gallery_imagenes_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_gallery_imagenes" ADD CONSTRAINT "productos_blocks_gallery_imagenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_gallery" ADD CONSTRAINT "productos_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_video" ADD CONSTRAINT "productos_blocks_video_archivo_id_media_id_fk" FOREIGN KEY ("archivo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_video" ADD CONSTRAINT "productos_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_video" ADD CONSTRAINT "productos_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_cta_body" ADD CONSTRAINT "productos_blocks_cta_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_cta" ADD CONSTRAINT "productos_blocks_cta_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_blocks_cta" ADD CONSTRAINT "productos_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_table_cabeceras" ADD CONSTRAINT "productos_blocks_table_cabeceras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_table_filas_celdas" ADD CONSTRAINT "productos_blocks_table_filas_celdas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_table_filas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_table_filas" ADD CONSTRAINT "productos_blocks_table_filas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_table" ADD CONSTRAINT "productos_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos" ADD CONSTRAINT "productos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos_galeria" ADD CONSTRAINT "casos_galeria_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos_galeria" ADD CONSTRAINT "casos_galeria_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_imagen_cabecera_id_media_id_fk" FOREIGN KEY ("imagen_cabecera_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos_rels" ADD CONSTRAINT "casos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "casos_rels" ADD CONSTRAINT "casos_rels_taxonomia_sectores_fk" FOREIGN KEY ("taxonomia_sectores_id") REFERENCES "public"."taxonomia_sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "casos_rels" ADD CONSTRAINT "casos_rels_productos_fk" FOREIGN KEY ("productos_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "taxonomia_sectores_rels" ADD CONSTRAINT "taxonomia_sectores_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."taxonomia_sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "taxonomia_sectores_rels" ADD CONSTRAINT "taxonomia_sectores_rels_sectores_fk" FOREIGN KEY ("sectores_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "taxonomia_sectores_rels" ADD CONSTRAINT "taxonomia_sectores_rels_monograficos_fk" FOREIGN KEY ("monograficos_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas_blog" ADD CONSTRAINT "entradas_blog_imagen_destacada_src_id_media_id_fk" FOREIGN KEY ("imagen_destacada_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entradas_blog" ADD CONSTRAINT "entradas_blog_recurso_id_categorias_recursos_id_fk" FOREIGN KEY ("recurso_id") REFERENCES "public"."categorias_recursos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entradas_blog_rels" ADD CONSTRAINT "entradas_blog_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas_blog_rels" ADD CONSTRAINT "entradas_blog_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entradas_blog_rels" ADD CONSTRAINT "entradas_blog_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documentos_cientificos" ADD CONSTRAINT "documentos_cientificos_categoria_id_categorias_cientificas_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_cientificas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documentos_cientificos" ADD CONSTRAINT "documentos_cientificos_portada_src_id_media_id_fk" FOREIGN KEY ("portada_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_titular" ADD CONSTRAINT "articulos_kb_blocks_titular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_claim" ADD CONSTRAINT "articulos_kb_blocks_claim_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_p" ADD CONSTRAINT "articulos_kb_blocks_p_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_ul_ul" ADD CONSTRAINT "articulos_kb_blocks_ul_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb_blocks_ul"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_ul" ADD CONSTRAINT "articulos_kb_blocks_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_claim_2" ADD CONSTRAINT "articulos_kb_blocks_claim_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_titular_2" ADD CONSTRAINT "articulos_kb_blocks_titular_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_texto" ADD CONSTRAINT "articulos_kb_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_imagen" ADD CONSTRAINT "articulos_kb_blocks_imagen_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_imagen" ADD CONSTRAINT "articulos_kb_blocks_imagen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_boton" ADD CONSTRAINT "articulos_kb_blocks_boton_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias_recursos" ADD CONSTRAINT "categorias_recursos_padre_id_categorias_recursos_id_fk" FOREIGN KEY ("padre_id") REFERENCES "public"."categorias_recursos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sectores_fk" FOREIGN KEY ("sectores_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_monograficos_fk" FOREIGN KEY ("monograficos_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_productos_fk" FOREIGN KEY ("productos_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_taxonomia_sectores_fk" FOREIGN KEY ("taxonomia_sectores_id") REFERENCES "public"."taxonomia_sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entradas_blog_fk" FOREIGN KEY ("entradas_blog_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_terminos_kunakpedia_fk" FOREIGN KEY ("terminos_kunakpedia_id") REFERENCES "public"."terminos_kunakpedia"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentos_cientificos_fk" FOREIGN KEY ("documentos_cientificos_id") REFERENCES "public"."documentos_cientificos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articulos_kb_fk" FOREIGN KEY ("articulos_kb_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_recursos_fk" FOREIGN KEY ("categorias_recursos_id") REFERENCES "public"."categorias_recursos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_cientificas_fk" FOREIGN KEY ("categorias_cientificas_id") REFERENCES "public"."categorias_cientificas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sectores_breadcrumb_order_idx" ON "sectores_breadcrumb" USING btree ("_order");
  CREATE INDEX "sectores_breadcrumb_parent_id_idx" ON "sectores_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "sectores_hero_ctas_order_idx" ON "sectores_hero_ctas" USING btree ("_order");
  CREATE INDEX "sectores_hero_ctas_parent_id_idx" ON "sectores_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "sectores_hero_paragraphs_order_idx" ON "sectores_hero_paragraphs" USING btree ("_order");
  CREATE INDEX "sectores_hero_paragraphs_parent_id_idx" ON "sectores_hero_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_cta_descarga_body_order_idx" ON "sectores_blocks_cta_descarga_body" USING btree ("_order");
  CREATE INDEX "sectores_blocks_cta_descarga_body_parent_id_idx" ON "sectores_blocks_cta_descarga_body" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_cta_descarga_order_idx" ON "sectores_blocks_cta_descarga" USING btree ("_order");
  CREATE INDEX "sectores_blocks_cta_descarga_parent_id_idx" ON "sectores_blocks_cta_descarga" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_cta_descarga_path_idx" ON "sectores_blocks_cta_descarga" USING btree ("_path");
  CREATE INDEX "sectores_blocks_cta_descarga_image_idx" ON "sectores_blocks_cta_descarga" USING btree ("image_id");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_left_items_order_idx" ON "sectores_blocks_beneficios_aplicaciones_left_items" USING btree ("_order");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_left_items_parent_id_idx" ON "sectores_blocks_beneficios_aplicaciones_left_items" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_right_items_order_idx" ON "sectores_blocks_beneficios_aplicaciones_right_items" USING btree ("_order");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_right_items_parent_id_idx" ON "sectores_blocks_beneficios_aplicaciones_right_items" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_order_idx" ON "sectores_blocks_beneficios_aplicaciones" USING btree ("_order");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_parent_id_idx" ON "sectores_blocks_beneficios_aplicaciones" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_beneficios_aplicaciones_path_idx" ON "sectores_blocks_beneficios_aplicaciones" USING btree ("_path");
  CREATE INDEX "sectores_blocks_claim_con_foto_order_idx" ON "sectores_blocks_claim_con_foto" USING btree ("_order");
  CREATE INDEX "sectores_blocks_claim_con_foto_parent_id_idx" ON "sectores_blocks_claim_con_foto" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_claim_con_foto_path_idx" ON "sectores_blocks_claim_con_foto" USING btree ("_path");
  CREATE INDEX "sectores_blocks_claim_con_foto_image_image_src_idx" ON "sectores_blocks_claim_con_foto" USING btree ("image_src_id");
  CREATE INDEX "sectores_blocks_lista_simple2_col_left_order_idx" ON "sectores_blocks_lista_simple2_col_left" USING btree ("_order");
  CREATE INDEX "sectores_blocks_lista_simple2_col_left_parent_id_idx" ON "sectores_blocks_lista_simple2_col_left" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_lista_simple2_col_right_order_idx" ON "sectores_blocks_lista_simple2_col_right" USING btree ("_order");
  CREATE INDEX "sectores_blocks_lista_simple2_col_right_parent_id_idx" ON "sectores_blocks_lista_simple2_col_right" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_lista_simple2_col_order_idx" ON "sectores_blocks_lista_simple2_col" USING btree ("_order");
  CREATE INDEX "sectores_blocks_lista_simple2_col_parent_id_idx" ON "sectores_blocks_lista_simple2_col" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_lista_simple2_col_path_idx" ON "sectores_blocks_lista_simple2_col" USING btree ("_path");
  CREATE INDEX "sectores_blocks_mapa_proyectos_pins_order_idx" ON "sectores_blocks_mapa_proyectos_pins" USING btree ("_order");
  CREATE INDEX "sectores_blocks_mapa_proyectos_pins_parent_id_idx" ON "sectores_blocks_mapa_proyectos_pins" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_mapa_proyectos_order_idx" ON "sectores_blocks_mapa_proyectos" USING btree ("_order");
  CREATE INDEX "sectores_blocks_mapa_proyectos_parent_id_idx" ON "sectores_blocks_mapa_proyectos" USING btree ("_parent_id");
  CREATE INDEX "sectores_blocks_mapa_proyectos_path_idx" ON "sectores_blocks_mapa_proyectos" USING btree ("_path");
  CREATE INDEX "sectores_cta_slides_order_idx" ON "sectores_cta_slides" USING btree ("_order");
  CREATE INDEX "sectores_cta_slides_parent_id_idx" ON "sectores_cta_slides" USING btree ("_parent_id");
  CREATE INDEX "sectores_cta_slides_image_idx" ON "sectores_cta_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "sectores_slug_idx" ON "sectores" USING btree ("slug");
  CREATE INDEX "sectores_header_header_image_idx" ON "sectores" USING btree ("header_image_id");
  CREATE INDEX "sectores_hero_image_hero_image_src_idx" ON "sectores" USING btree ("hero_image_src_id");
  CREATE INDEX "sectores_footer_strip_image_idx" ON "sectores" USING btree ("footer_strip_image_id");
  CREATE INDEX "sectores_updated_at_idx" ON "sectores" USING btree ("updated_at");
  CREATE INDEX "sectores_created_at_idx" ON "sectores" USING btree ("created_at");
  CREATE INDEX "sectores_rels_order_idx" ON "sectores_rels" USING btree ("order");
  CREATE INDEX "sectores_rels_parent_idx" ON "sectores_rels" USING btree ("parent_id");
  CREATE INDEX "sectores_rels_path_idx" ON "sectores_rels" USING btree ("path");
  CREATE INDEX "sectores_rels_productos_id_idx" ON "sectores_rels" USING btree ("productos_id");
  CREATE INDEX "sectores_rels_casos_id_idx" ON "sectores_rels" USING btree ("casos_id");
  CREATE INDEX "sectores_rels_entradas_blog_id_idx" ON "sectores_rels" USING btree ("entradas_blog_id");
  CREATE INDEX "monograficos_breadcrumb_order_idx" ON "monograficos_breadcrumb" USING btree ("_order");
  CREATE INDEX "monograficos_breadcrumb_parent_id_idx" ON "monograficos_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "monograficos_hero_ctas_order_idx" ON "monograficos_hero_ctas" USING btree ("_order");
  CREATE INDEX "monograficos_hero_ctas_parent_id_idx" ON "monograficos_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "monograficos_hero_modulos_paragraphs_order_idx" ON "monograficos_hero_modulos_paragraphs" USING btree ("_order");
  CREATE INDEX "monograficos_hero_modulos_paragraphs_parent_id_idx" ON "monograficos_hero_modulos_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "monograficos_hero_modulos_order_idx" ON "monograficos_hero_modulos" USING btree ("_order");
  CREATE INDEX "monograficos_hero_modulos_parent_id_idx" ON "monograficos_hero_modulos" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_titular_order_idx" ON "monograficos_blocks_titular" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_titular_parent_id_idx" ON "monograficos_blocks_titular" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_titular_path_idx" ON "monograficos_blocks_titular" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_claim_order_idx" ON "monograficos_blocks_claim" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_claim_parent_id_idx" ON "monograficos_blocks_claim" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_claim_path_idx" ON "monograficos_blocks_claim" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_p_order_idx" ON "monograficos_blocks_p" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_p_parent_id_idx" ON "monograficos_blocks_p" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_p_path_idx" ON "monograficos_blocks_p" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_ul_ul_order_idx" ON "monograficos_blocks_ul_ul" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_ul_ul_parent_id_idx" ON "monograficos_blocks_ul_ul" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_ul_order_idx" ON "monograficos_blocks_ul" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_ul_parent_id_idx" ON "monograficos_blocks_ul" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_ul_path_idx" ON "monograficos_blocks_ul" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_claim_2_order_idx" ON "monograficos_blocks_claim_2" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_claim_2_parent_id_idx" ON "monograficos_blocks_claim_2" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_claim_2_path_idx" ON "monograficos_blocks_claim_2" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_titular_2_order_idx" ON "monograficos_blocks_titular_2" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_titular_2_parent_id_idx" ON "monograficos_blocks_titular_2" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_titular_2_path_idx" ON "monograficos_blocks_titular_2" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_texto_order_idx" ON "monograficos_blocks_texto" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_texto_parent_id_idx" ON "monograficos_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_texto_path_idx" ON "monograficos_blocks_texto" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_imagen_order_idx" ON "monograficos_blocks_imagen" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_imagen_parent_id_idx" ON "monograficos_blocks_imagen" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_imagen_path_idx" ON "monograficos_blocks_imagen" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_imagen_src_idx" ON "monograficos_blocks_imagen" USING btree ("src_id");
  CREATE INDEX "monograficos_blocks_boton_order_idx" ON "monograficos_blocks_boton" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_boton_parent_id_idx" ON "monograficos_blocks_boton" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_boton_path_idx" ON "monograficos_blocks_boton" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_serie_items_order_idx" ON "monograficos_blocks_serie_items" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_serie_items_parent_id_idx" ON "monograficos_blocks_serie_items" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_serie_order_idx" ON "monograficos_blocks_serie" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_serie_parent_id_idx" ON "monograficos_blocks_serie" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_serie_path_idx" ON "monograficos_blocks_serie" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_tabla_cabeceras_order_idx" ON "monograficos_blocks_tabla_cabeceras" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_tabla_cabeceras_parent_id_idx" ON "monograficos_blocks_tabla_cabeceras" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_tabla_filas_celdas_order_idx" ON "monograficos_blocks_tabla_filas_celdas" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_tabla_filas_celdas_parent_id_idx" ON "monograficos_blocks_tabla_filas_celdas" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_tabla_filas_order_idx" ON "monograficos_blocks_tabla_filas" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_tabla_filas_parent_id_idx" ON "monograficos_blocks_tabla_filas" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_tabla_order_idx" ON "monograficos_blocks_tabla" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_tabla_parent_id_idx" ON "monograficos_blocks_tabla" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_tabla_path_idx" ON "monograficos_blocks_tabla" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_cta_descarga_body_order_idx" ON "monograficos_blocks_cta_descarga_body" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_cta_descarga_body_parent_id_idx" ON "monograficos_blocks_cta_descarga_body" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_cta_descarga_order_idx" ON "monograficos_blocks_cta_descarga" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_cta_descarga_parent_id_idx" ON "monograficos_blocks_cta_descarga" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_cta_descarga_path_idx" ON "monograficos_blocks_cta_descarga" USING btree ("_path");
  CREATE INDEX "monograficos_blocks_cta_descarga_image_idx" ON "monograficos_blocks_cta_descarga" USING btree ("image_id");
  CREATE INDEX "monograficos_blocks_mapa_proyectos_pins_order_idx" ON "monograficos_blocks_mapa_proyectos_pins" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_mapa_proyectos_pins_parent_id_idx" ON "monograficos_blocks_mapa_proyectos_pins" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_mapa_proyectos_order_idx" ON "monograficos_blocks_mapa_proyectos" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_mapa_proyectos_parent_id_idx" ON "monograficos_blocks_mapa_proyectos" USING btree ("_parent_id");
  CREATE INDEX "monograficos_blocks_mapa_proyectos_path_idx" ON "monograficos_blocks_mapa_proyectos" USING btree ("_path");
  CREATE INDEX "monograficos_cuerpo_filas_columnas_order_idx" ON "monograficos_cuerpo_filas_columnas" USING btree ("_order");
  CREATE INDEX "monograficos_cuerpo_filas_columnas_parent_id_idx" ON "monograficos_cuerpo_filas_columnas" USING btree ("_parent_id");
  CREATE INDEX "monograficos_cuerpo_filas_order_idx" ON "monograficos_cuerpo_filas" USING btree ("_order");
  CREATE INDEX "monograficos_cuerpo_filas_parent_id_idx" ON "monograficos_cuerpo_filas" USING btree ("_parent_id");
  CREATE INDEX "monograficos_cuerpo_order_idx" ON "monograficos_cuerpo" USING btree ("_order");
  CREATE INDEX "monograficos_cuerpo_parent_id_idx" ON "monograficos_cuerpo" USING btree ("_parent_id");
  CREATE INDEX "monograficos_cta_slides_order_idx" ON "monograficos_cta_slides" USING btree ("_order");
  CREATE INDEX "monograficos_cta_slides_parent_id_idx" ON "monograficos_cta_slides" USING btree ("_parent_id");
  CREATE INDEX "monograficos_cta_slides_image_idx" ON "monograficos_cta_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "monograficos_slug_idx" ON "monograficos" USING btree ("slug");
  CREATE INDEX "monograficos_header_header_image_idx" ON "monograficos" USING btree ("header_image_id");
  CREATE INDEX "monograficos_hero_image_hero_image_src_idx" ON "monograficos" USING btree ("hero_image_src_id");
  CREATE INDEX "monograficos_footer_strip_image_idx" ON "monograficos" USING btree ("footer_strip_image_id");
  CREATE INDEX "monograficos_updated_at_idx" ON "monograficos" USING btree ("updated_at");
  CREATE INDEX "monograficos_created_at_idx" ON "monograficos" USING btree ("created_at");
  CREATE INDEX "monograficos_rels_order_idx" ON "monograficos_rels" USING btree ("order");
  CREATE INDEX "monograficos_rels_parent_idx" ON "monograficos_rels" USING btree ("parent_id");
  CREATE INDEX "monograficos_rels_path_idx" ON "monograficos_rels" USING btree ("path");
  CREATE INDEX "monograficos_rels_productos_id_idx" ON "monograficos_rels" USING btree ("productos_id");
  CREATE INDEX "monograficos_rels_casos_id_idx" ON "monograficos_rels" USING btree ("casos_id");
  CREATE INDEX "monograficos_rels_entradas_blog_id_idx" ON "monograficos_rels" USING btree ("entradas_blog_id");
  CREATE INDEX "productos_bullets_order_idx" ON "productos_bullets" USING btree ("_order");
  CREATE INDEX "productos_bullets_parent_id_idx" ON "productos_bullets" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_titular_order_idx" ON "productos_blocks_titular" USING btree ("_order");
  CREATE INDEX "productos_blocks_titular_parent_id_idx" ON "productos_blocks_titular" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_titular_path_idx" ON "productos_blocks_titular" USING btree ("_path");
  CREATE INDEX "productos_blocks_claim_order_idx" ON "productos_blocks_claim" USING btree ("_order");
  CREATE INDEX "productos_blocks_claim_parent_id_idx" ON "productos_blocks_claim" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_claim_path_idx" ON "productos_blocks_claim" USING btree ("_path");
  CREATE INDEX "productos_blocks_p_order_idx" ON "productos_blocks_p" USING btree ("_order");
  CREATE INDEX "productos_blocks_p_parent_id_idx" ON "productos_blocks_p" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_p_path_idx" ON "productos_blocks_p" USING btree ("_path");
  CREATE INDEX "productos_blocks_ul_ul_order_idx" ON "productos_blocks_ul_ul" USING btree ("_order");
  CREATE INDEX "productos_blocks_ul_ul_parent_id_idx" ON "productos_blocks_ul_ul" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_ul_order_idx" ON "productos_blocks_ul" USING btree ("_order");
  CREATE INDEX "productos_blocks_ul_parent_id_idx" ON "productos_blocks_ul" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_ul_path_idx" ON "productos_blocks_ul" USING btree ("_path");
  CREATE INDEX "productos_blocks_claim_2_order_idx" ON "productos_blocks_claim_2" USING btree ("_order");
  CREATE INDEX "productos_blocks_claim_2_parent_id_idx" ON "productos_blocks_claim_2" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_claim_2_path_idx" ON "productos_blocks_claim_2" USING btree ("_path");
  CREATE INDEX "productos_blocks_titular_2_order_idx" ON "productos_blocks_titular_2" USING btree ("_order");
  CREATE INDEX "productos_blocks_titular_2_parent_id_idx" ON "productos_blocks_titular_2" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_titular_2_path_idx" ON "productos_blocks_titular_2" USING btree ("_path");
  CREATE INDEX "productos_blocks_texto_order_idx" ON "productos_blocks_texto" USING btree ("_order");
  CREATE INDEX "productos_blocks_texto_parent_id_idx" ON "productos_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_texto_path_idx" ON "productos_blocks_texto" USING btree ("_path");
  CREATE INDEX "productos_blocks_imagen_order_idx" ON "productos_blocks_imagen" USING btree ("_order");
  CREATE INDEX "productos_blocks_imagen_parent_id_idx" ON "productos_blocks_imagen" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_imagen_path_idx" ON "productos_blocks_imagen" USING btree ("_path");
  CREATE INDEX "productos_blocks_imagen_src_idx" ON "productos_blocks_imagen" USING btree ("src_id");
  CREATE INDEX "productos_blocks_boton_order_idx" ON "productos_blocks_boton" USING btree ("_order");
  CREATE INDEX "productos_blocks_boton_parent_id_idx" ON "productos_blocks_boton" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_boton_path_idx" ON "productos_blocks_boton" USING btree ("_path");
  CREATE INDEX "productos_blocks_toggle_order_idx" ON "productos_blocks_toggle" USING btree ("_order");
  CREATE INDEX "productos_blocks_toggle_parent_id_idx" ON "productos_blocks_toggle" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_toggle_path_idx" ON "productos_blocks_toggle" USING btree ("_path");
  CREATE INDEX "productos_blocks_blurb_order_idx" ON "productos_blocks_blurb" USING btree ("_order");
  CREATE INDEX "productos_blocks_blurb_parent_id_idx" ON "productos_blocks_blurb" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_blurb_path_idx" ON "productos_blocks_blurb" USING btree ("_path");
  CREATE INDEX "productos_blocks_blurb_icono_idx" ON "productos_blocks_blurb" USING btree ("icono_id");
  CREATE INDEX "productos_blocks_slider_diapositivas_order_idx" ON "productos_blocks_slider_diapositivas" USING btree ("_order");
  CREATE INDEX "productos_blocks_slider_diapositivas_parent_id_idx" ON "productos_blocks_slider_diapositivas" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_slider_diapositivas_image_idx" ON "productos_blocks_slider_diapositivas" USING btree ("image_id");
  CREATE INDEX "productos_blocks_slider_order_idx" ON "productos_blocks_slider" USING btree ("_order");
  CREATE INDEX "productos_blocks_slider_parent_id_idx" ON "productos_blocks_slider" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_slider_path_idx" ON "productos_blocks_slider" USING btree ("_path");
  CREATE INDEX "productos_blocks_gallery_imagenes_order_idx" ON "productos_blocks_gallery_imagenes" USING btree ("_order");
  CREATE INDEX "productos_blocks_gallery_imagenes_parent_id_idx" ON "productos_blocks_gallery_imagenes" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_gallery_imagenes_src_idx" ON "productos_blocks_gallery_imagenes" USING btree ("src_id");
  CREATE INDEX "productos_blocks_gallery_order_idx" ON "productos_blocks_gallery" USING btree ("_order");
  CREATE INDEX "productos_blocks_gallery_parent_id_idx" ON "productos_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_gallery_path_idx" ON "productos_blocks_gallery" USING btree ("_path");
  CREATE INDEX "productos_blocks_video_order_idx" ON "productos_blocks_video" USING btree ("_order");
  CREATE INDEX "productos_blocks_video_parent_id_idx" ON "productos_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_video_path_idx" ON "productos_blocks_video" USING btree ("_path");
  CREATE INDEX "productos_blocks_video_archivo_idx" ON "productos_blocks_video" USING btree ("archivo_id");
  CREATE INDEX "productos_blocks_video_poster_idx" ON "productos_blocks_video" USING btree ("poster_id");
  CREATE INDEX "productos_blocks_cta_body_order_idx" ON "productos_blocks_cta_body" USING btree ("_order");
  CREATE INDEX "productos_blocks_cta_body_parent_id_idx" ON "productos_blocks_cta_body" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_cta_order_idx" ON "productos_blocks_cta" USING btree ("_order");
  CREATE INDEX "productos_blocks_cta_parent_id_idx" ON "productos_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_cta_path_idx" ON "productos_blocks_cta" USING btree ("_path");
  CREATE INDEX "productos_blocks_cta_image_idx" ON "productos_blocks_cta" USING btree ("image_id");
  CREATE INDEX "productos_blocks_table_cabeceras_order_idx" ON "productos_blocks_table_cabeceras" USING btree ("_order");
  CREATE INDEX "productos_blocks_table_cabeceras_parent_id_idx" ON "productos_blocks_table_cabeceras" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_table_filas_celdas_order_idx" ON "productos_blocks_table_filas_celdas" USING btree ("_order");
  CREATE INDEX "productos_blocks_table_filas_celdas_parent_id_idx" ON "productos_blocks_table_filas_celdas" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_table_filas_order_idx" ON "productos_blocks_table_filas" USING btree ("_order");
  CREATE INDEX "productos_blocks_table_filas_parent_id_idx" ON "productos_blocks_table_filas" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_table_order_idx" ON "productos_blocks_table" USING btree ("_order");
  CREATE INDEX "productos_blocks_table_parent_id_idx" ON "productos_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_table_path_idx" ON "productos_blocks_table" USING btree ("_path");
  CREATE UNIQUE INDEX "productos_slug_idx" ON "productos" USING btree ("slug");
  CREATE INDEX "productos_image_idx" ON "productos" USING btree ("image_id");
  CREATE INDEX "productos_updated_at_idx" ON "productos" USING btree ("updated_at");
  CREATE INDEX "productos_created_at_idx" ON "productos" USING btree ("created_at");
  CREATE INDEX "casos_galeria_order_idx" ON "casos_galeria" USING btree ("_order");
  CREATE INDEX "casos_galeria_parent_id_idx" ON "casos_galeria" USING btree ("_parent_id");
  CREATE INDEX "casos_galeria_src_idx" ON "casos_galeria" USING btree ("src_id");
  CREATE UNIQUE INDEX "casos_slug_idx" ON "casos" USING btree ("slug");
  CREATE INDEX "casos_imagen_cabecera_idx" ON "casos" USING btree ("imagen_cabecera_id");
  CREATE INDEX "casos_updated_at_idx" ON "casos" USING btree ("updated_at");
  CREATE INDEX "casos_created_at_idx" ON "casos" USING btree ("created_at");
  CREATE INDEX "casos_rels_order_idx" ON "casos_rels" USING btree ("order");
  CREATE INDEX "casos_rels_parent_idx" ON "casos_rels" USING btree ("parent_id");
  CREATE INDEX "casos_rels_path_idx" ON "casos_rels" USING btree ("path");
  CREATE INDEX "casos_rels_taxonomia_sectores_id_idx" ON "casos_rels" USING btree ("taxonomia_sectores_id");
  CREATE INDEX "casos_rels_productos_id_idx" ON "casos_rels" USING btree ("productos_id");
  CREATE UNIQUE INDEX "faqs_slug_idx" ON "faqs" USING btree ("slug");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "taxonomia_sectores_slug_idx" ON "taxonomia_sectores" USING btree ("slug");
  CREATE INDEX "taxonomia_sectores_updated_at_idx" ON "taxonomia_sectores" USING btree ("updated_at");
  CREATE INDEX "taxonomia_sectores_created_at_idx" ON "taxonomia_sectores" USING btree ("created_at");
  CREATE INDEX "taxonomia_sectores_rels_order_idx" ON "taxonomia_sectores_rels" USING btree ("order");
  CREATE INDEX "taxonomia_sectores_rels_parent_idx" ON "taxonomia_sectores_rels" USING btree ("parent_id");
  CREATE INDEX "taxonomia_sectores_rels_path_idx" ON "taxonomia_sectores_rels" USING btree ("path");
  CREATE INDEX "taxonomia_sectores_rels_sectores_id_idx" ON "taxonomia_sectores_rels" USING btree ("sectores_id");
  CREATE INDEX "taxonomia_sectores_rels_monograficos_id_idx" ON "taxonomia_sectores_rels" USING btree ("monograficos_id");
  CREATE UNIQUE INDEX "entradas_blog_slug_idx" ON "entradas_blog" USING btree ("slug");
  CREATE INDEX "entradas_blog_imagen_destacada_imagen_destacada_src_idx" ON "entradas_blog" USING btree ("imagen_destacada_src_id");
  CREATE INDEX "entradas_blog_recurso_idx" ON "entradas_blog" USING btree ("recurso_id");
  CREATE INDEX "entradas_blog_updated_at_idx" ON "entradas_blog" USING btree ("updated_at");
  CREATE INDEX "entradas_blog_created_at_idx" ON "entradas_blog" USING btree ("created_at");
  CREATE INDEX "entradas_blog_rels_order_idx" ON "entradas_blog_rels" USING btree ("order");
  CREATE INDEX "entradas_blog_rels_parent_idx" ON "entradas_blog_rels" USING btree ("parent_id");
  CREATE INDEX "entradas_blog_rels_path_idx" ON "entradas_blog_rels" USING btree ("path");
  CREATE INDEX "entradas_blog_rels_categorias_id_idx" ON "entradas_blog_rels" USING btree ("categorias_id");
  CREATE INDEX "entradas_blog_rels_etiquetas_id_idx" ON "entradas_blog_rels" USING btree ("etiquetas_id");
  CREATE UNIQUE INDEX "terminos_kunakpedia_slug_idx" ON "terminos_kunakpedia" USING btree ("slug");
  CREATE INDEX "terminos_kunakpedia_updated_at_idx" ON "terminos_kunakpedia" USING btree ("updated_at");
  CREATE INDEX "terminos_kunakpedia_created_at_idx" ON "terminos_kunakpedia" USING btree ("created_at");
  CREATE UNIQUE INDEX "documentos_cientificos_slug_idx" ON "documentos_cientificos" USING btree ("slug");
  CREATE INDEX "documentos_cientificos_categoria_idx" ON "documentos_cientificos" USING btree ("categoria_id");
  CREATE INDEX "documentos_cientificos_portada_portada_src_idx" ON "documentos_cientificos" USING btree ("portada_src_id");
  CREATE INDEX "documentos_cientificos_updated_at_idx" ON "documentos_cientificos" USING btree ("updated_at");
  CREATE INDEX "documentos_cientificos_created_at_idx" ON "documentos_cientificos" USING btree ("created_at");
  CREATE INDEX "articulos_kb_blocks_titular_order_idx" ON "articulos_kb_blocks_titular" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_titular_parent_id_idx" ON "articulos_kb_blocks_titular" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_titular_path_idx" ON "articulos_kb_blocks_titular" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_claim_order_idx" ON "articulos_kb_blocks_claim" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_claim_parent_id_idx" ON "articulos_kb_blocks_claim" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_claim_path_idx" ON "articulos_kb_blocks_claim" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_p_order_idx" ON "articulos_kb_blocks_p" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_p_parent_id_idx" ON "articulos_kb_blocks_p" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_p_path_idx" ON "articulos_kb_blocks_p" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_ul_ul_order_idx" ON "articulos_kb_blocks_ul_ul" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_ul_ul_parent_id_idx" ON "articulos_kb_blocks_ul_ul" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_ul_order_idx" ON "articulos_kb_blocks_ul" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_ul_parent_id_idx" ON "articulos_kb_blocks_ul" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_ul_path_idx" ON "articulos_kb_blocks_ul" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_claim_2_order_idx" ON "articulos_kb_blocks_claim_2" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_claim_2_parent_id_idx" ON "articulos_kb_blocks_claim_2" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_claim_2_path_idx" ON "articulos_kb_blocks_claim_2" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_titular_2_order_idx" ON "articulos_kb_blocks_titular_2" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_titular_2_parent_id_idx" ON "articulos_kb_blocks_titular_2" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_titular_2_path_idx" ON "articulos_kb_blocks_titular_2" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_texto_order_idx" ON "articulos_kb_blocks_texto" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_texto_parent_id_idx" ON "articulos_kb_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_texto_path_idx" ON "articulos_kb_blocks_texto" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_imagen_order_idx" ON "articulos_kb_blocks_imagen" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_imagen_parent_id_idx" ON "articulos_kb_blocks_imagen" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_imagen_path_idx" ON "articulos_kb_blocks_imagen" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_imagen_src_idx" ON "articulos_kb_blocks_imagen" USING btree ("src_id");
  CREATE INDEX "articulos_kb_blocks_boton_order_idx" ON "articulos_kb_blocks_boton" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_boton_parent_id_idx" ON "articulos_kb_blocks_boton" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_boton_path_idx" ON "articulos_kb_blocks_boton" USING btree ("_path");
  CREATE UNIQUE INDEX "articulos_kb_slug_idx" ON "articulos_kb" USING btree ("slug");
  CREATE INDEX "articulos_kb_updated_at_idx" ON "articulos_kb" USING btree ("updated_at");
  CREATE INDEX "articulos_kb_created_at_idx" ON "articulos_kb" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "etiquetas_slug_idx" ON "etiquetas" USING btree ("slug");
  CREATE INDEX "etiquetas_updated_at_idx" ON "etiquetas" USING btree ("updated_at");
  CREATE INDEX "etiquetas_created_at_idx" ON "etiquetas" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_recursos_slug_idx" ON "categorias_recursos" USING btree ("slug");
  CREATE INDEX "categorias_recursos_padre_idx" ON "categorias_recursos" USING btree ("padre_id");
  CREATE INDEX "categorias_recursos_updated_at_idx" ON "categorias_recursos" USING btree ("updated_at");
  CREATE INDEX "categorias_recursos_created_at_idx" ON "categorias_recursos" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_cientificas_slug_idx" ON "categorias_cientificas" USING btree ("slug");
  CREATE INDEX "categorias_cientificas_updated_at_idx" ON "categorias_cientificas" USING btree ("updated_at");
  CREATE INDEX "categorias_cientificas_created_at_idx" ON "categorias_cientificas" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_sm_sizes_sm_filename_idx" ON "media" USING btree ("sizes_sm_filename");
  CREATE INDEX "media_sizes_md_sizes_md_filename_idx" ON "media" USING btree ("sizes_md_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_card_wide_sizes_card_wide_filename_idx" ON "media" USING btree ("sizes_card_wide_filename");
  CREATE INDEX "media_sizes_lg_sizes_lg_filename_idx" ON "media" USING btree ("sizes_lg_filename");
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_sectores_id_idx" ON "payload_locked_documents_rels" USING btree ("sectores_id");
  CREATE INDEX "payload_locked_documents_rels_monograficos_id_idx" ON "payload_locked_documents_rels" USING btree ("monograficos_id");
  CREATE INDEX "payload_locked_documents_rels_productos_id_idx" ON "payload_locked_documents_rels" USING btree ("productos_id");
  CREATE INDEX "payload_locked_documents_rels_casos_id_idx" ON "payload_locked_documents_rels" USING btree ("casos_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_taxonomia_sectores_id_idx" ON "payload_locked_documents_rels" USING btree ("taxonomia_sectores_id");
  CREATE INDEX "payload_locked_documents_rels_entradas_blog_id_idx" ON "payload_locked_documents_rels" USING btree ("entradas_blog_id");
  CREATE INDEX "payload_locked_documents_rels_terminos_kunakpedia_id_idx" ON "payload_locked_documents_rels" USING btree ("terminos_kunakpedia_id");
  CREATE INDEX "payload_locked_documents_rels_documentos_cientificos_id_idx" ON "payload_locked_documents_rels" USING btree ("documentos_cientificos_id");
  CREATE INDEX "payload_locked_documents_rels_articulos_kb_id_idx" ON "payload_locked_documents_rels" USING btree ("articulos_kb_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_etiquetas_id_idx" ON "payload_locked_documents_rels" USING btree ("etiquetas_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_recursos_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_recursos_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_cientificas_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_cientificas_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "sectores_breadcrumb" CASCADE;
  DROP TABLE "sectores_hero_ctas" CASCADE;
  DROP TABLE "sectores_hero_paragraphs" CASCADE;
  DROP TABLE "sectores_blocks_cta_descarga_body" CASCADE;
  DROP TABLE "sectores_blocks_cta_descarga" CASCADE;
  DROP TABLE "sectores_blocks_beneficios_aplicaciones_left_items" CASCADE;
  DROP TABLE "sectores_blocks_beneficios_aplicaciones_right_items" CASCADE;
  DROP TABLE "sectores_blocks_beneficios_aplicaciones" CASCADE;
  DROP TABLE "sectores_blocks_claim_con_foto" CASCADE;
  DROP TABLE "sectores_blocks_lista_simple2_col_left" CASCADE;
  DROP TABLE "sectores_blocks_lista_simple2_col_right" CASCADE;
  DROP TABLE "sectores_blocks_lista_simple2_col" CASCADE;
  DROP TABLE "sectores_blocks_mapa_proyectos_pins" CASCADE;
  DROP TABLE "sectores_blocks_mapa_proyectos" CASCADE;
  DROP TABLE "sectores_cta_slides" CASCADE;
  DROP TABLE "sectores" CASCADE;
  DROP TABLE "sectores_rels" CASCADE;
  DROP TABLE "monograficos_breadcrumb" CASCADE;
  DROP TABLE "monograficos_hero_ctas" CASCADE;
  DROP TABLE "monograficos_hero_modulos_paragraphs" CASCADE;
  DROP TABLE "monograficos_hero_modulos" CASCADE;
  DROP TABLE "monograficos_blocks_titular" CASCADE;
  DROP TABLE "monograficos_blocks_claim" CASCADE;
  DROP TABLE "monograficos_blocks_p" CASCADE;
  DROP TABLE "monograficos_blocks_ul_ul" CASCADE;
  DROP TABLE "monograficos_blocks_ul" CASCADE;
  DROP TABLE "monograficos_blocks_claim_2" CASCADE;
  DROP TABLE "monograficos_blocks_titular_2" CASCADE;
  DROP TABLE "monograficos_blocks_texto" CASCADE;
  DROP TABLE "monograficos_blocks_imagen" CASCADE;
  DROP TABLE "monograficos_blocks_boton" CASCADE;
  DROP TABLE "monograficos_blocks_serie_items" CASCADE;
  DROP TABLE "monograficos_blocks_serie" CASCADE;
  DROP TABLE "monograficos_blocks_tabla_cabeceras" CASCADE;
  DROP TABLE "monograficos_blocks_tabla_filas_celdas" CASCADE;
  DROP TABLE "monograficos_blocks_tabla_filas" CASCADE;
  DROP TABLE "monograficos_blocks_tabla" CASCADE;
  DROP TABLE "monograficos_blocks_cta_descarga_body" CASCADE;
  DROP TABLE "monograficos_blocks_cta_descarga" CASCADE;
  DROP TABLE "monograficos_blocks_mapa_proyectos_pins" CASCADE;
  DROP TABLE "monograficos_blocks_mapa_proyectos" CASCADE;
  DROP TABLE "monograficos_cuerpo_filas_columnas" CASCADE;
  DROP TABLE "monograficos_cuerpo_filas" CASCADE;
  DROP TABLE "monograficos_cuerpo" CASCADE;
  DROP TABLE "monograficos_cta_slides" CASCADE;
  DROP TABLE "monograficos" CASCADE;
  DROP TABLE "monograficos_rels" CASCADE;
  DROP TABLE "productos_bullets" CASCADE;
  DROP TABLE "productos_blocks_titular" CASCADE;
  DROP TABLE "productos_blocks_claim" CASCADE;
  DROP TABLE "productos_blocks_p" CASCADE;
  DROP TABLE "productos_blocks_ul_ul" CASCADE;
  DROP TABLE "productos_blocks_ul" CASCADE;
  DROP TABLE "productos_blocks_claim_2" CASCADE;
  DROP TABLE "productos_blocks_titular_2" CASCADE;
  DROP TABLE "productos_blocks_texto" CASCADE;
  DROP TABLE "productos_blocks_imagen" CASCADE;
  DROP TABLE "productos_blocks_boton" CASCADE;
  DROP TABLE "productos_blocks_toggle" CASCADE;
  DROP TABLE "productos_blocks_blurb" CASCADE;
  DROP TABLE "productos_blocks_slider_diapositivas" CASCADE;
  DROP TABLE "productos_blocks_slider" CASCADE;
  DROP TABLE "productos_blocks_gallery_imagenes" CASCADE;
  DROP TABLE "productos_blocks_gallery" CASCADE;
  DROP TABLE "productos_blocks_video" CASCADE;
  DROP TABLE "productos_blocks_cta_body" CASCADE;
  DROP TABLE "productos_blocks_cta" CASCADE;
  DROP TABLE "productos_blocks_table_cabeceras" CASCADE;
  DROP TABLE "productos_blocks_table_filas_celdas" CASCADE;
  DROP TABLE "productos_blocks_table_filas" CASCADE;
  DROP TABLE "productos_blocks_table" CASCADE;
  DROP TABLE "productos" CASCADE;
  DROP TABLE "casos_galeria" CASCADE;
  DROP TABLE "casos" CASCADE;
  DROP TABLE "casos_rels" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "taxonomia_sectores" CASCADE;
  DROP TABLE "taxonomia_sectores_rels" CASCADE;
  DROP TABLE "entradas_blog" CASCADE;
  DROP TABLE "entradas_blog_rels" CASCADE;
  DROP TABLE "terminos_kunakpedia" CASCADE;
  DROP TABLE "documentos_cientificos" CASCADE;
  DROP TABLE "articulos_kb_blocks_titular" CASCADE;
  DROP TABLE "articulos_kb_blocks_claim" CASCADE;
  DROP TABLE "articulos_kb_blocks_p" CASCADE;
  DROP TABLE "articulos_kb_blocks_ul_ul" CASCADE;
  DROP TABLE "articulos_kb_blocks_ul" CASCADE;
  DROP TABLE "articulos_kb_blocks_claim_2" CASCADE;
  DROP TABLE "articulos_kb_blocks_titular_2" CASCADE;
  DROP TABLE "articulos_kb_blocks_texto" CASCADE;
  DROP TABLE "articulos_kb_blocks_imagen" CASCADE;
  DROP TABLE "articulos_kb_blocks_boton" CASCADE;
  DROP TABLE "articulos_kb" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "etiquetas" CASCADE;
  DROP TABLE "categorias_recursos" CASCADE;
  DROP TABLE "categorias_cientificas" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_sectores_blocks_cta_descarga_variante";
  DROP TYPE "public"."enum_sectores_blocks_cta_descarga_flujo";
  DROP TYPE "public"."enum_sectores_blocks_beneficios_aplicaciones_flujo";
  DROP TYPE "public"."enum_sectores_blocks_claim_con_foto_flujo";
  DROP TYPE "public"."enum_sectores_blocks_lista_simple2_col_flujo";
  DROP TYPE "public"."enum_sectores_blocks_mapa_proyectos_flujo";
  DROP TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho";
  DROP TYPE "public"."enum_productos_tipo";
  DROP TYPE "public"."enum_productos_padre";
  DROP TYPE "public"."enum_casos_prefijo";
  DROP TYPE "public"."enum_documentos_cientificos_prefijo";`)
}
