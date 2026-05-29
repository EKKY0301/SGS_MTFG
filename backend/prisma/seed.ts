import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos para generación aleatoria
const NOMBRES = [
  'Juan', 'Carlos', 'Miguel', 'José', 'Francisco', 'Manuel', 'Fernando', 'Antonio', 'Pablo', 'Andrés',
  'Luis', 'Roberto', 'Ricardo', 'Alejandro', 'Sergio', 'Javier', 'Ramón', 'Enrique', 'Víctor', 'Eduardo',
  'Diego', 'Raúl', 'Arturo', 'Óscar', 'Mateo', 'Ignacio', 'Claudio', 'Héctor', 'César', 'Armando'
];

const NOMBRES_FEMENINOS = [
  'María', 'Ana', 'Isabel', 'Carmen', 'Rosa', 'Teresa', 'Francisca', 'Juana', 'Dolores', 'Pilar',
  'Patricia', 'Sandra', 'Laura', 'Susana', 'Mónica', 'Claudia', 'Verónica', 'Graciela', 'Alicia', 'Silvia',
  'Catalina', 'Marta', 'Lorena', 'Margarita', 'Elena', 'Beatriz', 'Gabriela', 'Roxana', 'Fernanda', 'Victoria'
];

const APELLIDOS = [
  'García', 'Rodríguez', 'Martínez', 'Mendoza', 'Flores', 'Díaz', 'Silva', 'López', 'Ruiz', 'Sánchez',
  'Ramírez', 'Gutiérrez', 'Torres', 'Morales', 'Campos', 'Vargas', 'Castro', 'Vega', 'Rojas', 'Herrera',
  'Gómez', 'Fernández', 'Salazar', 'Quispe', 'Condori', 'Mamani', 'Pacaya', 'Chamba', 'Achig', 'Yánez',
  'Reyes', 'Cabrera', 'Soto', 'Valenzuela', 'Romero', 'Peña', 'Gutierez', 'Suárez', 'Cortés', 'Delgado'
];

const PAISES = [
  'Ecuador', 'Perú', 'Colombia', 'Bolivia', 'Venezuela', 'Chile', 'Argentina', 'Paraguay', 'Uruguay', 'Brasil'
];

const PROFESIONES = [
  'Ingeniero', 'Contador', 'Abogado', 'Médico', 'Enfermero', 'Profesor', 'Comerciante', 'Carpintero',
  'Electricista', 'Plomero', 'Chef', 'Mecánico', 'Taxista', 'Vendedor', 'Consultor', 'Gerente',
  'Técnico', 'Agricultor', 'Fabricante', 'Transportista', 'Constructor', 'Diseñador', 'Analista',
  'Programador', 'Artesano', 'Floristería', 'Peluquero', 'Costurera', 'Zapatero', 'Panadero'
];

const TIPOS_DOCUMENTO = ['cédula', 'pasaporte', 'carnet de extranjería'];
const VISA_STATUS = ['visa', 'residencia', 'ciudadanía'];
const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const GENEROS = ['M', 'F'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName(isFemale: boolean): [string, string] {
  const nombre = isFemale ? getRandomElement(NOMBRES_FEMENINOS) : getRandomElement(NOMBRES);
  const apellido1 = getRandomElement(APELLIDOS);
  return [nombre, apellido1];
}

function generateDocumentNumber(): string {
  return 'DOC' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function generatePhone(): string {
  return `+593-98-${String(getRandomInt(100, 999))}-${String(getRandomInt(1000, 9999))}`;
}

function generateEmail(nombre: string, apellido: string): string {
  return `${nombre.toLowerCase()}.${apellido.toLowerCase()}${getRandomInt(1, 999)}@email.com`;
}

function getRandomBirthDate(minAge: number = 18, maxAge: number = 80): Date {
  const today = new Date();
  const birth = new Date(
    today.getFullYear() - getRandomInt(minAge, maxAge),
    getRandomInt(0, 11),
    getRandomInt(1, 28)
  );
  return birth;
}

async function main() {
  console.log('🌱 Iniciando seed masivo de miembros...');

  // Limpiar datos existentes
  console.log('🗑️ Limpiando datos anteriores...');
  await prisma.member.deleteMany({});
  await prisma.group.deleteMany({});
  console.log('✓ Datos antiguos eliminados');
  const grupos: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const grupo = await prisma.group.upsert({
      where: { name: `Grupo ${i}` },
      update: {},
      create: { name: `Grupo ${i}` },
    });
    grupos.push(grupo);
  }
  console.log(`✓ ${grupos.length} grupos creados`);

  const allMembers: any[] = [];
  let memberCounter = 1;
  const totalPrincipales = getRandomInt(100, 150);
  
  console.log(`\n📝 Creando ${totalPrincipales} socios principales...`);

  // Crear socios principales
  for (let i = 0; i < totalPrincipales; i++) {
    const isFemale = Math.random() > 0.5;
    const [nombre, apellido] = generateName(isFemale);
    const documentNumber = generateDocumentNumber();
    const genero = isFemale ? 'F' : 'M';
    
    const principalMember = await prisma.member.create({
      data: {
        name: nombre,
        surname: apellido,
        japaneseName: nombre, // Simplificado para seed masivo
        japaneseSurname: apellido,
        role: 'principal',
        memberNumber: 1000 + memberCounter++,
        status: Math.random() > 0.9 ? 'moroso' : 'active', // 10% morosos
        sex: genero,
        birthDate: getRandomBirthDate(25, 75),
        documentType: getRandomElement(TIPOS_DOCUMENTO),
        documentNumber: documentNumber,
        documentExpDate: new Date(new Date().getFullYear() + getRandomInt(1, 10), 0, 1),
        visaStatus: getRandomElement(VISA_STATUS),
        countryOrigin: getRandomElement(PAISES),
        email: generateEmail(nombre, apellido),
        phone: generatePhone(),
        bloodType: getRandomElement(BLOOD_TYPES),
        address: `Calle ${getRandomInt(1, 100)} #${getRandomInt(1, 999)}`,
        profession: getRandomElement(PROFESIONES),
        workAddress: `Empresa ${getRandomInt(1, 500)}`,
        workPhone: generatePhone(),
        groupId: getRandomElement(grupos).id,
        joinDate: new Date(2010 + getRandomInt(0, 14), getRandomInt(0, 11), 1),
        responsible: true,
      },
    });

    allMembers.push(principalMember);

    // Mostrar progreso cada 10 socios
    if ((i + 1) % 20 === 0) {
      console.log(`  ${i + 1}/${totalPrincipales} socios principales creados...`);
    }
  }

  console.log(`✓ ${totalPrincipales} socios principales creados`);

  // Crear parejas, hijos y padres
  console.log(`\n👨‍👩‍👧‍👦 Creando parejas, hijos y padres...`);

  let parejaCount = 0;
  let hijosCount = 0;
  let padresCount = 0;

  for (let i = 0; i < allMembers.length; i++) {
    const principal = allMembers[i];

    // Crear pareja con 70% de probabilidad
    if (Math.random() < 0.7) {
      const isFemale = principal.sex === 'M';
      const [nombre, apellido] = generateName(isFemale);
      
      const pareja = await prisma.member.create({
        data: {
          name: nombre,
          surname: apellido,
          japaneseName: nombre,
          japaneseSurname: apellido,
          role: 'spouse',
          status: 'active',
          sex: isFemale ? 'F' : 'M',
          birthDate: getRandomBirthDate(20, 70),
          documentType: getRandomElement(TIPOS_DOCUMENTO),
          documentNumber: generateDocumentNumber(),
          documentExpDate: new Date(new Date().getFullYear() + getRandomInt(1, 10), 0, 1),
          visaStatus: getRandomElement(VISA_STATUS),
          countryOrigin: getRandomElement(PAISES),
          email: generateEmail(nombre, apellido),
          phone: generatePhone(),
          bloodType: getRandomElement(BLOOD_TYPES),
          address: principal.address,
          partnerId: principal.id,
          adminParentId: principal.id,
          groupId: principal.groupId,
          joinDate: principal.joinDate,
        },
      });

      parejaCount++;

      // Crear hijos (0-3) con la pareja
      const numHijos = getRandomInt(0, 3);
      for (let h = 0; h < numHijos; h++) {
        const isFemaleHijo = Math.random() > 0.5;
        const [nombreHijo, apellidoHijo] = generateName(isFemaleHijo);
        
        const hijo = await prisma.member.create({
          data: {
            name: nombreHijo,
            surname: apellidoHijo,
            japaneseName: nombreHijo,
            japaneseSurname: apellidoHijo,
            role: 'child',
            status: 'active',
            sex: isFemaleHijo ? 'F' : 'M',
            birthDate: getRandomBirthDate(0, 25),
            documentType: getRandomElement(TIPOS_DOCUMENTO),
            documentNumber: generateDocumentNumber(),
            visaStatus: 'residencia',
            countryOrigin: principal.countryOrigin,
            bloodType: getRandomElement(BLOOD_TYPES),
            address: principal.address,
            adminParentId: principal.id,
            biologicalFatherId: principal.sex === 'M' ? principal.id : null,
            biologicalMotherId: principal.sex === 'F' ? principal.id : pareja.id,
            groupId: principal.groupId,
            joinDate: principal.joinDate,
          },
        });

        hijosCount++;
      }
    }

    // Crear padre/madre con 30% de probabilidad
    if (Math.random() < 0.3) {
      const isFemaleParent = Math.random() > 0.5;
      const [nombrePadre, apellidoPadre] = generateName(isFemaleParent);
      
      const padre = await prisma.member.create({
        data: {
          name: nombrePadre,
          surname: apellidoPadre,
          japaneseName: nombrePadre,
          japaneseSurname: apellidoPadre,
          role: 'parent',
          status: 'active',
          sex: isFemaleParent ? 'F' : 'M',
          birthDate: getRandomBirthDate(60, 95),
          documentType: getRandomElement(TIPOS_DOCUMENTO),
          documentNumber: generateDocumentNumber(),
          documentExpDate: new Date(new Date().getFullYear() + getRandomInt(1, 5), 0, 1),
          visaStatus: getRandomElement(VISA_STATUS),
          countryOrigin: principal.countryOrigin,
          bloodType: getRandomElement(BLOOD_TYPES),
          address: principal.address,
          profession: getRandomElement(PROFESIONES),
          groupId: principal.groupId,
          joinDate: new Date(2005 + getRandomInt(0, 10), getRandomInt(0, 11), 1),
        },
      });

      // Actualizar principal con relación biológica
      if (isFemaleParent) {
        await prisma.member.update({
          where: { id: principal.id },
          data: { biologicalMotherId: padre.id },
        });
      } else {
        await prisma.member.update({
          where: { id: principal.id },
          data: { biologicalFatherId: padre.id },
        });
      }

      padresCount++;
    }

    // Mostrar progreso
    if ((i + 1) % 25 === 0) {
      console.log(`  ${i + 1}/${totalPrincipales} socios procesados...`);
    }
  }

  console.log(`✓ ${parejaCount} parejas creadas`);
  console.log(`✓ ${hijosCount} hijos creados`);
  console.log(`✓ ${padresCount} padres creados`);
  // Crear datos de prueba específicos para filtro "nonPrincipalTurning18ThisYear" (nacidos en 2008)
  console.log(`\n🧪 Creando datos de prueba para cumpleaños...`);
  
  let testDataCount = 0;
  const testYears = [2007, 2008, 2009]; // 2007: 19 años, 2008: 18 años, 2009: 17 años
  
  for (const year of testYears) {
    // Crear 3 principales con hijos específicos para cada año
    for (let t = 0; t < 3; t++) {
      const isFemale = Math.random() > 0.5;
      const [nombre, apellido] = generateName(isFemale);
      
      const testPrincipal = await prisma.member.create({
        data: {
          name: `Test-${year}-${t}-` + nombre,
          surname: apellido,
          japaneseName: nombre,
          japaneseSurname: apellido,
          role: 'principal',
          memberNumber: 2000 + (year - 2007) * 100 + t,
          status: 'active',
          sex: isFemale ? 'F' : 'M',
          birthDate: getRandomBirthDate(35, 55),
          documentType: getRandomElement(TIPOS_DOCUMENTO),
          documentNumber: generateDocumentNumber(),
          documentExpDate: new Date(new Date().getFullYear() + getRandomInt(1, 10), 0, 1),
          visaStatus: getRandomElement(VISA_STATUS),
          countryOrigin: getRandomElement(PAISES),
          email: generateEmail(`test${year}${t}`, apellido),
          phone: generatePhone(),
          bloodType: getRandomElement(BLOOD_TYPES),
          address: `Test Address ${year} #${t}`,
          profession: getRandomElement(PROFESIONES),
          workAddress: `Test Company ${year}`,
          workPhone: generatePhone(),
          groupId: getRandomElement(grupos).id,
          joinDate: new Date(2015, 0, 1),
          responsible: true,
        },
      });

      // Crear pareja
      const isPartnerFemale = testPrincipal.sex === 'M';
      const [nombrePareja, apellidoPareja] = generateName(isPartnerFemale);
      
      const testPartner = await prisma.member.create({
        data: {
          name: nombrePareja,
          surname: apellidoPareja,
          japaneseName: nombrePareja,
          japaneseSurname: apellidoPareja,
          role: 'spouse',
          status: 'active',
          sex: isPartnerFemale ? 'F' : 'M',
          birthDate: getRandomBirthDate(30, 50),
          documentType: getRandomElement(TIPOS_DOCUMENTO),
          documentNumber: generateDocumentNumber(),
          documentExpDate: new Date(new Date().getFullYear() + getRandomInt(1, 10), 0, 1),
          visaStatus: getRandomElement(VISA_STATUS),
          countryOrigin: getRandomElement(PAISES),
          email: generateEmail(nombrePareja, apellidoPareja),
          phone: generatePhone(),
          bloodType: getRandomElement(BLOOD_TYPES),
          address: testPrincipal.address,
          partnerId: testPrincipal.id,
          adminParentId: testPrincipal.id,
          groupId: testPrincipal.groupId,
          joinDate: testPrincipal.joinDate,
        },
      });

      // Crear 2 hijos en el año específico
      for (let h = 0; h < 2; h++) {
        const isChildFemale = Math.random() > 0.5;
        const [nombreHijo, apellidoHijo] = generateName(isChildFemale);
        
        // Fecha de nacimiento en el año específico (mes y día aleatorios)
        const birthDate = new Date(year, getRandomInt(0, 11), getRandomInt(1, 28));

        const testChild = await prisma.member.create({
          data: {
            name: nombreHijo,
            surname: apellidoHijo,
            japaneseName: nombreHijo,
            japaneseSurname: apellidoHijo,
            role: 'child',
            status: 'active',
            sex: isChildFemale ? 'F' : 'M',
            birthDate: birthDate,
            documentType: getRandomElement(TIPOS_DOCUMENTO),
            documentNumber: generateDocumentNumber(),
            visaStatus: 'residencia',
            countryOrigin: testPrincipal.countryOrigin,
            bloodType: getRandomElement(BLOOD_TYPES),
            address: testPrincipal.address,
            adminParentId: testPrincipal.id,
            biologicalFatherId: testPrincipal.sex === 'M' ? testPrincipal.id : null,
            biologicalMotherId: testPrincipal.sex === 'F' ? testPrincipal.id : testPartner.id,
            groupId: testPrincipal.groupId,
            joinDate: testPrincipal.joinDate,
          },
        });

        testDataCount++;
      }
    }
  }

  console.log(`✓ ${testDataCount} hijos de prueba creados (2007, 2008, 2009)`);
  // Resumen final
  const totalMembers = await prisma.member.count();
  const totalActive = await prisma.member.count({ where: { status: 'active' } });
  const totalMorosos = await prisma.member.count({ where: { status: 'moroso' } });

  console.log('\n✅ Seed completado exitosamente!');
  console.log(`\n📊 Resumen final:`);
  console.log(`- Grupos: 5`);
  console.log(`- Socios principales: ${totalPrincipales}`);
  console.log(`- Parejas: ${parejaCount}`);
  console.log(`- Hijos/Dependientes: ${hijosCount}`);
  console.log(`- Hijos de prueba (años 2007,2008,2009): ${testDataCount}`);
  console.log(`- Padres: ${padresCount}`);
  console.log(`\n📈 Total miembros en base de datos: ${totalMembers}`);
  console.log(`   - Activos: ${totalActive}`);
  console.log(`   - Morosos: ${totalMorosos}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
