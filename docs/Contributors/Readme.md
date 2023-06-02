# A lightweigth and kludgy method to generate the list of contributors 

```bash
git shortlog -sne > raw_contributors.txt
python simplify.py
```
