# COG

## Setting up GDAL 

```bash
pip install numpy>1.0.0 wheel setuptools>=67
pip install gdal[numpy]=="$(gdal-config --version).*"
```
