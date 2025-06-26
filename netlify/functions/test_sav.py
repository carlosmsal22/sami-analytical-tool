import pyreadstat
import json

df, meta = pyreadstat.read_sav("ruta/a/tu/archivo.sav")

summary = {
    "num_rows": len(df),
    "num_columns": len(df.columns),
    "column_names": list(df.columns),
    "column_types": {col: str(dtype) for col, dtype in zip(df.columns, df.dtypes)},
    "labelled_columns": [col for col in df.columns if meta.column_labels.get(col)],
    "missing_values": df.isnull().sum().to_dict()
}

print(json.dumps(summary, indent=2))
