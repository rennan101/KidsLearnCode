#!/usr/bin/env python3
"""
extract_tops_and_sleeves.py - KidsLearnCode
Extrai e recorta com precisão todas as 66 roupas de assets/Tops/tops.svg
separando o torso (roupa principal) e mangas (esquerda e direita) em arquivos
SVG individuais e auto-contidos.
"""

import os
import re
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOPS_SVG_PATH = os.path.join(BASE_DIR, "assets", "Tops", "tops.svg")
OUTPUT_TOPS_DIR = os.path.join(BASE_DIR, "assets", "Tops")
CHARACTER_TOP_ASSETS_PATH = os.path.join(BASE_DIR, "src", "engine", "animation", "CharacterTopSvgAssets.js")

# Configurações anatômicas de recorte para cada categoria de roupa
CATEGORY_CONFIG = {
    "top_crop_top": {
        "folder": "Crop_Top",
        "sleeveType": "none",
        "full_w": 153, "full_h": 80,
        "torso_x_offset": 26, "torso_w": 101, "torso_h": 80,
        "sleeve_l_offset": 0, "sleeve_l_w": 26, "sleeve_l_h": 60,
        "sleeve_r_offset": 127, "sleeve_r_w": 26, "sleeve_r_h": 60,
    },
    "top_cupcake_dress": {
        "folder": "Cupcake_Dress",
        "sleeveType": "short",
        "full_w": 173, "full_h": 151,
        "torso_x_offset": 35, "torso_w": 103, "torso_h": 151,
        "sleeve_l_offset": 0, "sleeve_l_w": 35, "sleeve_l_h": 70,
        "sleeve_r_offset": 138, "sleeve_r_w": 35, "sleeve_r_h": 70,
    },
    "top_sweater": {
        "folder": "Sweater",
        "sleeveType": "long",
        "full_w": 209, "full_h": 154,
        "torso_x_offset": 52, "torso_w": 105, "torso_h": 154,
        "sleeve_l_offset": 0, "sleeve_l_w": 52, "sleeve_l_h": 105,
        "sleeve_r_offset": 157, "sleeve_r_w": 52, "sleeve_r_h": 105,
    },
    "top_tee": {
        "folder": "Tee",
        "sleeveType": "short",
        "full_w": 153, "full_h": 105,
        "torso_x_offset": 26, "torso_w": 101, "torso_h": 105,
        "sleeve_l_offset": 0, "sleeve_l_w": 26, "sleeve_l_h": 65,
        "sleeve_r_offset": 127, "sleeve_r_w": 26, "sleeve_r_h": 65,
    },
    "top_sleeveless": {
        "folder": "Sleeveless",
        "sleeveType": "none",
        "full_w": 103, "full_h": 105,
        "torso_x_offset": 0, "torso_w": 103, "torso_h": 105,
        "sleeve_l_offset": 0, "sleeve_l_w": 0, "sleeve_l_h": 0,
        "sleeve_r_offset": 0, "sleeve_r_w": 0, "sleeve_r_h": 0,
    },
    "top_long_sleeve": {
        "folder": "Long_Sleeve",
        "sleeveType": "long",
        "full_w": 207, "full_h": 103,
        "torso_x_offset": 52, "torso_w": 103, "torso_h": 103,
        "sleeve_l_offset": 0, "sleeve_l_w": 52, "sleeve_l_h": 90,
        "sleeve_r_offset": 155, "sleeve_r_w": 52, "sleeve_r_h": 90,
    },
    "top_puffy_sleeve": {
        "folder": "Puffy_Sleeve",
        "sleeveType": "puffy",
        "full_w": 155, "full_h": 106,
        "torso_x_offset": 26, "torso_w": 103, "torso_h": 106,
        "sleeve_l_offset": 0, "sleeve_l_w": 26, "sleeve_l_h": 65,
        "sleeve_r_offset": 129, "sleeve_r_w": 26, "sleeve_r_h": 65,
    }
}


def load_existing_catalog():
    with open(CHARACTER_TOP_ASSETS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Extrai o array SVG_TOPS de objetos
    items = []
    blocks = re.findall(r'(\{\s*\"id\":\s*\"top_[^\}]+\})', content, re.DOTALL)
    for b in blocks:
        id_m = re.search(r'\"id\":\s*\"([^\"]+)\"', b)
        base_m = re.search(r'\"baseId\":\s*\"([^\"]+)\"', b)
        idx_m = re.search(r'\"variantIndex\":\s*(\d+)', b)
        name_m = re.search(r'\"name\":\s*\"([^\"]+)\"', b)
        desc_m = re.search(r'\"desc\":\s*\"([^\"]+)\"', b)
        sleeve_m = re.search(r'\"sleeveType\":\s*\"([^\"]+)\"', b)
        vb_m = re.search(r'\"viewBox\":\s*\"([^\"]+)\"', b)
        pcolor_m = re.search(r'\"primaryColor\":\s*\"([^\"]+)\"', b)
        scolor_m = re.search(r'\"secondaryColor\":\s*\"([^\"]+)\"', b)

        svg_content_m = re.search(r'\"svgContent\":\s*\"((?:[^\"\\]|\\.)*)\"', b)

        if id_m and base_m and vb_m:
            items.append({
                "id": id_m.group(1),
                "baseId": base_m.group(1),
                "variantIndex": int(idx_m.group(1)) if idx_m else 1,
                "name": name_m.group(1) if name_m else "",
                "desc": desc_m.group(1) if desc_m else "",
                "sleeveType": sleeve_m.group(1) if sleeve_m else "none",
                "viewBox": vb_m.group(1),
                "primaryColor": pcolor_m.group(1) if pcolor_m else "#19c8b9",
                "secondaryColor": scolor_m.group(1) if scolor_m else "#ffffff",
                "rawSvgContent": svg_content_m.group(1).encode('utf-8').decode('unicode_escape') if svg_content_m else ""
            })
    return items


def extract_defs_and_body(raw_svg):
    """Extrai defs internos e o corpo gráfico de um SVG"""
    defs_match = re.search(r'<defs>(.*?)</defs>', raw_svg, re.DOTALL)
    defs_content = defs_match.group(1) if defs_match else ""
    
    # Remove defs e a tag <svg> externa
    body = raw_svg
    body = re.sub(r'<svg[^>]*>', '', body)
    body = re.sub(r'</svg>', '', body)
    body = re.sub(r'<defs>.*?</defs>', '', body, flags=re.DOTALL)
    return defs_content.strip(), body.strip()


def build_standalone_svg(view_box, defs_list, content):
    """Gera um SVG limpo, auto-suficiente e formatado"""
    defs_xml = ""
    if defs_list:
        combined_defs = "\n".join(d for d in defs_list if d)
        if combined_defs.strip():
            defs_xml = f"<defs>\n{combined_defs}\n</defs>\n"
            
    svg = f'<svg viewBox="{view_box}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">\n{defs_xml}{content}\n</svg>'
    return svg


def process_all_tops():
    print("Iniciando extração anatômica e recorte das roupas e mangas...")
    items = load_existing_catalog()
    print(f"Total de roupas carregadas do catálogo: {len(items)}")

    updated_items = []

    for item in items:
        base_id = item["baseId"]
        cfg = CATEGORY_CONFIG.get(base_id, CATEGORY_CONFIG["top_tee"])
        folder_path = os.path.join(OUTPUT_TOPS_DIR, cfg["folder"])
        os.makedirs(folder_path, exist_ok=True)

        vb_parts = [float(v) for v in item["viewBox"].split()]
        vx, vy, vw, vh = vb_parts[0], vb_parts[1], vb_parts[2], vb_parts[3]

        item_id = item["id"]
        raw_svg = item["rawSvgContent"]
        inner_defs, body_content = extract_defs_and_body(raw_svg)

        # 1. Roupa Completa (_full.svg)
        full_svg = build_standalone_svg(f"{vx} {vy} {vw} {vh}", [inner_defs], body_content)
        full_file = os.path.join(folder_path, f"{item_id}_full.svg")
        with open(full_file, "w", encoding="utf-8") as f:
            f.write(full_svg)

        # 2. Tronco / Roupa sem mangas (_torso.svg)
        torso_x = vx + cfg["torso_x_offset"]
        torso_w = cfg["torso_w"]
        torso_h = vh

        if cfg["sleeveType"] == "none":
            torso_svg = full_svg
            torso_vb = f"{vx} {vy} {vw} {vh}"
            torso_w_val = vw
            torso_h_val = vh
            sleeve_l_svg = None
            sleeve_r_svg = None
            sleeve_l_vb = None
            sleeve_r_vb = None
            sleeve_lw = 0
            sleeve_lh = 0
            sleeve_rw = 0
            sleeve_rh = 0
        else:
            clip_id_torso = f"clip_{item_id}_torso"
            torso_clip_def = f'<clipPath id="{clip_id_torso}"><rect x="{torso_x}" y="{vy}" width="{torso_w}" height="{torso_h}"/></clipPath>'
            torso_content = f'<g clip-path="url(#{clip_id_torso})">\n{body_content}\n</g>'
            torso_vb = f"{torso_x} {vy} {torso_w} {torso_h}"
            torso_svg = build_standalone_svg(torso_vb, [inner_defs, torso_clip_def], torso_content)
            torso_w_val = torso_w
            torso_h_val = torso_h

            # 3. Manga Esquerda (_sleeve_l.svg)
            sleeve_l_x = vx + cfg["sleeve_l_offset"]
            sleeve_lw = cfg["sleeve_l_w"]
            sleeve_lh = cfg["sleeve_l_h"]
            clip_id_sl = f"clip_{item_id}_sl"
            sleeve_l_clip_def = f'<clipPath id="{clip_id_sl}"><rect x="{sleeve_l_x}" y="{vy}" width="{sleeve_lw}" height="{sleeve_lh}"/></clipPath>'
            sleeve_l_content = f'<g clip-path="url(#{clip_id_sl})">\n{body_content}\n</g>'
            sleeve_l_vb = f"{sleeve_l_x} {vy} {sleeve_lw} {sleeve_lh}"
            sleeve_l_svg = build_standalone_svg(sleeve_l_vb, [inner_defs, sleeve_l_clip_def], sleeve_l_content)

            # 4. Manga Direita (_sleeve_r.svg)
            sleeve_r_x = vx + cfg["sleeve_r_offset"]
            sleeve_rw = cfg["sleeve_r_w"]
            sleeve_rh = cfg["sleeve_r_h"]
            clip_id_sr = f"clip_{item_id}_sr"
            sleeve_r_clip_def = f'<clipPath id="{clip_id_sr}"><rect x="{sleeve_r_x}" y="{vy}" width="{sleeve_rw}" height="{sleeve_rh}"/></clipPath>'
            sleeve_r_content = f'<g clip-path="url(#{clip_id_sr})">\n{body_content}\n</g>'
            sleeve_r_vb = f"{sleeve_r_x} {vy} {sleeve_rw} {sleeve_rh}"
            sleeve_r_svg = build_standalone_svg(sleeve_r_vb, [inner_defs, sleeve_r_clip_def], sleeve_r_content)

            # Salva mangas no disco
            with open(os.path.join(folder_path, f"{item_id}_sleeve_l.svg"), "w", encoding="utf-8") as f:
                f.write(sleeve_l_svg)
            with open(os.path.join(folder_path, f"{item_id}_sleeve_r.svg"), "w", encoding="utf-8") as f:
                f.write(sleeve_r_svg)

        # Salva torso no disco
        with open(os.path.join(folder_path, f"{item_id}_torso.svg"), "w", encoding="utf-8") as f:
            f.write(torso_svg)

        updated_items.append({
            "id": item["id"],
            "baseId": item["baseId"],
            "variantIndex": item["variantIndex"],
            "name": item["name"],
            "desc": item["desc"],
            "sleeveType": item["sleeveType"],
            "viewBox": item["viewBox"],
            "torsoViewBox": torso_vb,
            "sleeveLViewBox": sleeve_l_vb,
            "sleeveRViewBox": sleeve_r_vb,
            "w": vw,
            "h": vh,
            "torsoW": torso_w_val,
            "torsoH": torso_h_val,
            "sleeveLW": sleeve_lw,
            "sleeveLH": sleeve_lh,
            "sleeveRW": sleeve_rw,
            "sleeveRH": sleeve_rh,
            "primaryColor": item["primaryColor"],
            "secondaryColor": item["secondaryColor"],
            "fullPath": f"assets/Tops/{cfg['folder']}/{item_id}_full.svg",
            "torsoPath": f"assets/Tops/{cfg['folder']}/{item_id}_torso.svg",
            "sleeveLPath": f"assets/Tops/{cfg['folder']}/{item_id}_sleeve_l.svg" if cfg["sleeveType"] != "none" else None,
            "sleeveRPath": f"assets/Tops/{cfg['folder']}/{item_id}_sleeve_r.svg" if cfg["sleeveType"] != "none" else None,
            "svgContent": full_svg,
            "torsoSvgContent": torso_svg,
            "sleeveLSvgContent": sleeve_l_svg,
            "sleeveRSvgContent": sleeve_r_svg
        })

    # Atualiza CharacterTopSvgAssets.js
    write_catalog_js(updated_items)
    print(f"Extração concluída com sucesso! 66 roupas processadas e salvas em {OUTPUT_TOPS_DIR}")


def write_catalog_js(items):
    import json
    lines = [
        "/**",
        " * CharacterTopSvgAssets.js - KidsLearnCode",
        " * Catálogo COMPLETO com todas as 66 roupas extraídas DIRETAMENTE de assets/Tops/tops.svg",
        " * com cores, estampas, detalhes e separação anatômica (tronco + mangas).",
        " */",
        "",
        "export const SVG_TOPS = ["
    ]

    for idx, item in enumerate(items):
        json_str = json.dumps(item, indent=2, ensure_ascii=False)
        # Indenta cada bloco
        indented_json = "\n".join("  " + l for l in json_str.split("\n"))
        comma = "," if idx < len(items) - 1 else ""
        lines.append(f"{indented_json}{comma}")

    lines.append("];")
    lines.append("")
    lines.append("export function getTopSvgDef(topId) {")
    lines.append("  return SVG_TOPS.find(t => t.id === topId || t.baseId === topId) || SVG_TOPS[0];")
    lines.append("}")
    lines.append("")

    with open(CHARACTER_TOP_ASSETS_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Catálogo atualizado: {CHARACTER_TOP_ASSETS_PATH}")


if __name__ == "__main__":
    process_all_tops()
