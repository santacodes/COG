# COG

## Creating and activating a virtual environment 
```bash
python -m venv venv
source venv/bin/activate
```
## Installing dependencies
```bash
pip install -r requirements.txt
```

## Setting up GDAL 

```bash
pip install numpy>2.0.0 wheel setuptools>=67
pip install gdal[numpy]=="$(gdal-config --version).*"
```
or 
```bash
pip install --no-cache --force-reinstall gdal[numpy]=="$(gdal-config --version).*"
```
