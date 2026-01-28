import { NextRequest, NextResponse } from 'next/server';

interface PriceRange {
  minM3: number;
  maxM3: number;
  unitPrice: number;
}

interface Contract {
  id: string;
  customerId: string;
  siteCode: string;
  siteName: string;
  m3Limit: number;
  currentM3Used: number;
  priceRanges: PriceRange[];
  startDate: Date;
  endDate: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock contracts (development only)
const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    customerId: 'cust-1',
    siteCode: 'SITE001',
    siteName: 'ABC İnşaat - Bahçelievler Projesi',
    m3Limit: 300,
    currentM3Used: 120,
    priceRanges: [
      { minM3: 0, maxM3: 100, unitPrice: 950 },
      { minM3: 100, maxM3: 300, unitPrice: 900 },
    ],
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    active: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'contract-2',
    customerId: 'cust-1',
    siteCode: 'SITE002',
    siteName: 'ABC İnşaat - Pendik Şantiyesi',
    m3Limit: 500,
    currentM3Used: 200,
    priceRanges: [
      { minM3: 0, maxM3: 150, unitPrice: 920 },
      { minM3: 150, maxM3: 500, unitPrice: 880 },
    ],
    startDate: new Date('2026-02-01'),
    endDate: null,
    active: true,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'contract-3',
    customerId: 'cust-2',
    siteCode: 'SITE003',
    siteName: 'XYZ Yapı - Kadıköy Projesi',
    m3Limit: 250,
    currentM3Used: 80,
    priceRanges: [
      { minM3: 0, maxM3: 250, unitPrice: 1050 },
    ],
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-06-30'),
    active: true,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-29'),
  },
];

// GET /api/contracts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    let contracts = mockContracts;

    if (customerId) {
      contracts = contracts.filter((c) => c.customerId === customerId);
    }

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contracts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, siteCode, siteName, m3Limit, priceRanges, endDate } =
      body;

    // Check if site code exists for this customer
    const existingContract = mockContracts.find(
      (c) => c.customerId === customerId && c.siteCode === siteCode
    );
    if (existingContract) {
      return NextResponse.json(
        { error: 'Contract with this site code already exists for this customer' },
        { status: 409 }
      );
    }

    const newContract: Contract = {
      id: `contract-${mockContracts.length + 1}`,
      customerId,
      siteCode,
      siteName,
      m3Limit,
      currentM3Used: 0,
      priceRanges: priceRanges || [
        { minM3: 0, maxM3: m3Limit, unitPrice: 1000 },
      ],
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockContracts.push(newContract);

    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    console.error('Create contract error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
