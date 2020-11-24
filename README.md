# Ticket Exchange

Ejemplo de un DEX con Uniswap.

![alt text](https://github.com/jperaza1/uniswap-dex/blob/main/img/Captura%20de%20pantalla%20de%202020-11-24%2006-04-53.png)

Creamos un token ECR20 llamado **BusCoin (BSCN)** y lo listamos en Uniswap.
Creamos un mercado en Uniswap entre **BusCoin (BSCN) y Ether ETH**, para que aquel que tenga **BusCoin (BSCN)**, pueda reclamar un ticket de autobus en fisico.

## Librerias usadas

* **@uniswap/sdk** Nos permite hacer las operaciones, calcular precio, calcular el impacto en el mercado y realizar el trade.
* **ethers** Nos Permite conectarnos a los contratos inteligentes de uniswap.
