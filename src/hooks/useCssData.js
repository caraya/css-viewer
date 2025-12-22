import { useState, useEffect } from 'react';
import axios from 'axios';

export function useCssData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cssResponse, specsResponse] = await Promise.all([
          axios.get('/css-data.json?t=' + Date.now()),
          axios.get('/specs.json?t=' + Date.now())
        ]);

        const cssData = cssResponse.data;
        const specsData = specsResponse.data;

        // Flatten properties, at-rules, etc.
        const properties = [];
        const atRules = [];
        const values = [];
        
        Object.entries(cssData).forEach(([shortname, specData]) => {
            const sourceSpec = specData.spec || { title: shortname };
            const note = specData.note; // Extract note if present
            
            if (specData.properties) {
                specData.properties.forEach(prop => {
                    properties.push({ 
                        ...prop, 
                        spec: shortname, 
                        sourceSpec,
                        note, // Pass note to item
                        type: 'property' 
                    });
                });
            }
            if (specData.atrules) {
                 specData.atrules.forEach(rule => {
                    atRules.push({ 
                        ...rule, 
                        spec: shortname, 
                        sourceSpec,
                        note, // Pass note to item
                        type: 'at-rule' 
                    });
                });
            }
            if (specData.values) {
                specData.values.forEach(val => {
                   values.push({ 
                       ...val, 
                       spec: shortname, 
                       sourceSpec,
                       note, // Pass note to item
                       type: val.type === 'function' ? 'function' : 'value'
                    });
               });
           }
        });

        setData({ cssData, specsData, properties, atRules, values });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
