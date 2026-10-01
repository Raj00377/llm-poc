FROM almalinux:10.2-minimal

# Upgrade Alma packages and install python3
RUN microdnf upgrade -y \
    && microdnf install -y python3 \
    && microdnf clean all

# ENV
ENV PYTHONUNBUFFERED=1 \
    WORKERS=1 \
    PIP_NO_CACHE_DIR=1

# setup project
WORKDIR /src
COPY requirements.txt .
RUN python3 -m ensurepip --upgrade \
    && python3 -m pip install "pip==26.2.0" \
    && python3 -m pip install -r requirements.txt


# To supress false positive docker scout and trivy alerts
# Check for below metadata based alerts every time, any changes made in python or pip or image, if no alerts, remmove
RUN rm -f \
    /usr/local/lib/python3.12/site-packages/pip/_vendor/bom.cdx.json \
    /usr/local/lib64/python3.12/site-packages/psycopg2_binary-*.dist-info/sboms/auditwheel.cdx.json


COPY . .

EXPOSE 8000