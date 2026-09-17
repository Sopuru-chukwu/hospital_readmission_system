import numpy as np
import pandas as pd
from typing import List, Dict

def get_feature_importances(model, feature_names: List[str]) -> List[Dict[str, float]]:
    """
    Extracts global Gini feature importance scores from tree-based classifier.
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        return [
            {
                "feature": feature_names[idx],
                "importance": float(round(importances[idx], 4))
            }
            for idx in sorted_indices
        ]
    return []
