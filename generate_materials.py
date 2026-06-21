import csv
import re
import os

def classify(name):
    name_l = name.lower()
    
    # 1. Non-steel classes
    if 'aluminum' in name_l:
        return 'Aluminum Alloys'
    if 'magnesium' in name_l:
        return 'Magnesium Alloys'
    if 'titanium' in name_l:
        return 'Titanium Alloys'
    if 'cast iron' in name_l or 'ductile iron' in name_l or 'gray iron' in name_l or 'malleable iron' in name_l or 'nodular iron' in name_l or 'wrought iron' in name_l:
        return 'Cast Iron'
    if 'iron' in name_l and 'cast' in name_l:
        return 'Cast Iron'
    if any(k in name_l for k in ['copper', 'bronze', 'brass', 'muntz', 'cupronickel', 'red brass', 'yellow brass', 'gilding metal', 'cartridge brass', 'nickel silver']):
        return 'Copper Alloys'
    if re.search(r'\bc\d{5}\b', name_l):
        return 'Copper Alloys'
    if 'carbon fiber' in name_l or 'cfrp' in name_l or 'carbon/epoxy' in name_l:
        return 'Carbon Fiber Reinforced Polymer'
    if 'glass fiber' in name_l or 'gfrp' in name_l or 'glass/epoxy' in name_l:
        return 'Glass Fiber Reinforced Polymer'
        
    # 2. Stainless Steel specific markers
    if 'stainless' in name_l or any(w in name_l for w in ['sus304', 'sus316', 'sus321', 'sus430', 'sus410', 'sus303', '304s11', '304s15', '316s11', '316s31', '321s31', '410s21', '430s17']):
        return 'Stainless Steel'
    if 'steel' in name_l and any(w in name_l for w in ['304', '316', '321', '410', '430']):
        return 'Stainless Steel'
    if any(p in name for p in ['BS 304', 'BS 316', 'BS 321', 'BS 410', 'BS 430', 'SUS304', 'SUS316', 'SUS321', 'SUS430', 'SUS410']):
        return 'Stainless Steel'
        
    # 3. Regular Steel
    if any(k in name_l for k in ['steel', 'gost', 'bs ', 'din ', 'sae ', 'en ', 'aisi', 'astm', 'structural', 'forged', 'maraging', 'tool steel', 'hss', 'case hardening']):
        return 'Steel'
    if any(name.startswith(p) for p in ['CSN ', 'JIS ', 'SIS ', 'UNE ', 'NBN ', 'NF ', 'SS ', 'SFS ', 'ONORM ', 'ÖNORM ', 'DS ', 'MIL ', 'UNS ']):
        return 'Steel'
        
    return 'Steel'  # fallback to Steel for any remaining entries

# Materials to inject for completeness
injected_materials = [
    # Titanium Alloys
    {
        "name": "Titanium Ti-6Al-4V",
        "grade": "Grade 5",
        "materialClass": "Titanium Alloys",
        "density": 4.43,
        "strength": 950,
        "cost": 38.0,
        "corrosion": 10.0,
        "wear": 8.0,
        "sustainability": 5.0,
        "elasticModulus": 114.0,
        "hardness": 340.0
    },
    {
        "name": "Titanium Ti-3Al-2.5V",
        "grade": "Grade 9",
        "materialClass": "Titanium Alloys",
        "density": 4.48,
        "strength": 620,
        "cost": 32.0,
        "corrosion": 10.0,
        "wear": 7.0,
        "sustainability": 5.0,
        "elasticModulus": 100.0,
        "hardness": 210.0
    },
    {
        "name": "Titanium Grade 2",
        "grade": "Unalloyed Commercial",
        "materialClass": "Titanium Alloys",
        "density": 4.51,
        "strength": 344,
        "cost": 25.0,
        "corrosion": 9.0,
        "wear": 5.0,
        "sustainability": 6.0,
        "elasticModulus": 103.0,
        "hardness": 145.0
    },
    {
        "name": "Titanium Alloy Ti-6-2-4-2",
        "grade": "Ti-6Al-2Sn-4Zr-2Mo",
        "materialClass": "Titanium Alloys",
        "density": 4.54,
        "strength": 1030,
        "cost": 45.0,
        "corrosion": 10.0,
        "wear": 8.0,
        "sustainability": 5.0,
        "elasticModulus": 114.0,
        "hardness": 360.0
    },
    {
        "name": "Titanium Aluminide",
        "grade": "TiAl-Gamma",
        "materialClass": "Titanium Alloys",
        "density": 3.9,
        "strength": 650,
        "cost": 55.0,
        "corrosion": 10.0,
        "wear": 9.0,
        "sustainability": 5.0,
        "elasticModulus": 160.0,
        "hardness": 380.0
    },
    {
        "name": "Titanium Alloy Ti-10-2-3",
        "grade": "Ti-10V-2Fe-3Al",
        "materialClass": "Titanium Alloys",
        "density": 4.65,
        "strength": 1150,
        "cost": 50.0,
        "corrosion": 9.0,
        "wear": 8.0,
        "sustainability": 5.0,
        "elasticModulus": 110.0,
        "hardness": 370.0
    },
    # Carbon Fiber Reinforced Polymer
    {
        "name": "Carbon Fiber Composite",
        "grade": "High-Modulus Epoxy/CF",
        "materialClass": "Carbon Fiber Reinforced Polymer",
        "density": 1.55,
        "strength": 1600,
        "cost": 72.0,
        "corrosion": 10.0,
        "wear": 7.0,
        "sustainability": 4.0,
        "elasticModulus": 135.0,
        "hardness": 55.0
    },
    {
        "name": "Carbon Fiber Composite",
        "grade": "High-Strength Epoxy/CF",
        "materialClass": "Carbon Fiber Reinforced Polymer",
        "density": 1.50,
        "strength": 1900,
        "cost": 65.0,
        "corrosion": 10.0,
        "wear": 6.0,
        "sustainability": 4.0,
        "elasticModulus": 110.0,
        "hardness": 50.0
    },
    {
        "name": "Recycled Carbon Fiber",
        "grade": "rCF/Thermoplastic",
        "materialClass": "Carbon Fiber Reinforced Polymer",
        "density": 1.58,
        "strength": 850,
        "cost": 32.0,
        "corrosion": 9.0,
        "wear": 6.0,
        "sustainability": 8.0,
        "elasticModulus": 95.0,
        "hardness": 50.0
    },
    {
        "name": "CFRP Woven Laminate",
        "grade": "Woven Epoxy/CF",
        "materialClass": "Carbon Fiber Reinforced Polymer",
        "density": 1.52,
        "strength": 900,
        "cost": 50.0,
        "corrosion": 10.0,
        "wear": 6.0,
        "sustainability": 5.0,
        "elasticModulus": 75.0,
        "hardness": 45.0
    },
    {
        "name": "CFRP Uni-directional",
        "grade": "UD Epoxy/CF",
        "materialClass": "Carbon Fiber Reinforced Polymer",
        "density": 1.60,
        "strength": 2200,
        "cost": 85.0,
        "corrosion": 10.0,
        "wear": 7.0,
        "sustainability": 3.0,
        "elasticModulus": 150.0,
        "hardness": 60.0
    },
    {
        "name": "CFRP SMC",
        "grade": "Sheet Molding Compound",
        "materialClass": "Carbon Fiber Reinforced Polymer",
        "density": 1.45,
        "strength": 300,
        "cost": 18.0,
        "corrosion": 10.0,
        "wear": 5.0,
        "sustainability": 6.0,
        "elasticModulus": 40.0,
        "hardness": 35.0
    },
    # Glass Fiber Reinforced Polymer
    {
        "name": "Glass Fiber Composite",
        "grade": "S-Glass / Epoxy",
        "materialClass": "Glass Fiber Reinforced Polymer",
        "density": 1.95,
        "strength": 480,
        "cost": 14.0,
        "corrosion": 9.0,
        "wear": 5.0,
        "sustainability": 5.0,
        "elasticModulus": 43.0,
        "hardness": 45.0
    },
    {
        "name": "Glass Fiber PP",
        "grade": "E-Glass / PP (GMT)",
        "materialClass": "Glass Fiber Reinforced Polymer",
        "density": 1.45,
        "strength": 310,
        "cost": 7.5,
        "corrosion": 9.0,
        "wear": 4.0,
        "sustainability": 7.0,
        "elasticModulus": 28.0,
        "hardness": 35.0
    },
    {
        "name": "Glass Fiber Composite",
        "grade": "E-Glass / Polyester",
        "materialClass": "Glass Fiber Reinforced Polymer",
        "density": 1.80,
        "strength": 250,
        "cost": 6.0,
        "corrosion": 9.0,
        "wear": 4.0,
        "sustainability": 6.0,
        "elasticModulus": 20.0,
        "hardness": 30.0
    },
    {
        "name": "GFRP SMC",
        "grade": "Glass Sheet Molding",
        "materialClass": "Glass Fiber Reinforced Polymer",
        "density": 1.90,
        "strength": 180,
        "cost": 5.5,
        "corrosion": 9.0,
        "wear": 4.0,
        "sustainability": 6.0,
        "elasticModulus": 15.0,
        "hardness": 32.0
    },
    {
        "name": "Woven Glass/Epoxy",
        "grade": "Laminate Core",
        "materialClass": "Glass Fiber Reinforced Polymer",
        "density": 2.05,
        "strength": 380,
        "cost": 11.0,
        "corrosion": 9.0,
        "wear": 5.0,
        "sustainability": 5.0,
        "elasticModulus": 30.0,
        "hardness": 40.0
    }
]

materials = []
id_counter = 1

def clean_float(val, default=0.0):
    if not val:
        return default
    try:
        # Strip trailing newlines or spaces or surrounding quotes
        val = val.strip().replace('\"', '').replace('\'', '')
        return float(val)
    except ValueError:
        # Try extracting numbers
        match = re.search(r'[-+]?\d*\.\d+|\d+', val)
        if match:
            return float(match.group())
        return default

# Load CSV
with open('material_selection_dataset.csv', 'r') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) < 11:
            continue
        
        name = row[0].strip().replace('\"', '')
        grade = row[1].strip()
        density = clean_float(row[2])
        # TensileStrength is mapped to strength
        strength = int(clean_float(row[3]))
        hardness = clean_float(row[5])
        # ElasticModulus is divided by 1000 to convert MPa -> GPa
        elasticModulus = clean_float(row[6]) / 1000.0
        cost = clean_float(row[7])
        corrosion = clean_float(row[8])
        wear = clean_float(row[9])
        sustainability = clean_float(row[10])
        
        m_class = classify(name)
        
        materials.append({
            "id": f"mat_csv_{id_counter}",
            "name": name,
            "grade": grade,
            "materialClass": m_class,
            "density": density,
            "strength": strength,
            "cost": cost,
            "corrosion": corrosion,
            "wear": wear,
            "sustainability": sustainability,
            "elasticModulus": round(elasticModulus, 2),
            "hardness": hardness
        })
        id_counter += 1

# Add injected classes (Titanium Alloys, CFRP, GFRP)
for inj in injected_materials:
    materials.append({
        "id": f"mat_inj_{id_counter}",
        **inj
    })
    id_counter += 1

# Output as TS file
output_path = 'src/materials_data.ts'
with open(output_path, 'w') as f:
    f.write("import { Material } from './types';\n\n")
    f.write("const rawMaterials: any[] = [\n")
    for m in materials:
        f.write("  {\n")
        for k, v in m.items():
            if isinstance(v, str):
                # Escape quotes
                v_escaped = v.replace('"', '\\"')
                f.write(f'    {k}: "{v_escaped}",\n')
            else:
                f.write(f'    {k}: {v},\n')
        f.write("  },\n")
    f.write("];\n\n")
    f.write("export const MATERIALS: Material[] = rawMaterials as Material[];\n")

print(f"Successfully processed {len(materials)} materials and wrote to {output_path}.")
