import dns from "dns/promises";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();
    const targetIp = "203.194.114.4";

    const records = await dns.resolve4(domain);
    
    const isPointed = records.includes(targetIp);

    console.log(records);
    console.log(isPointed);

    if (isPointed) {
      return NextResponse.json({ 
        success: true, 
        message: "Domain correctly pointed to server!" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Domain pointed to ${records.join(", ")}, but expected ${targetIp}` 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "DNS Record not found or domain not registered." 
    }, { status: 404 });
  }
}