from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

setup(
    name="courts_management",
    version="1.0.0",
    description="Courts Management Command Centre - Real-time ERP Intelligence Dashboard",
    author="Courts Management Team",
    author_email="admin@courts.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires
)
