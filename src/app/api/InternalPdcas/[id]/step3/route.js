export const dynamic = "force-dynamic";
import ProjectDetail from "@/app/models/ProjectDetail";
import { connectDB } from "@/app/models/InternalPdca";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await ProjectDetail.findOne({ projectId: id });
    return NextResponse.json({ data: data || {} }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    const {
      projectName, departmentName, divisionName, projectType, strategicAlignment,
      rationale, objectives, targets, overallPeriod, overallLocation, steps,
      budgetSources, budget, expectedOutcomes, evaluationMethods,
      proposer, endorser, approver
    } = body;

    const data = await ProjectDetail.findOneAndUpdate(
      { projectId: id },
      {
        projectId: id,
        projectName, departmentName, divisionName, projectType, strategicAlignment,
        rationale, objectives, targets, overallPeriod, overallLocation, steps,
        budgetSources, budget, expectedOutcomes, evaluationMethods,
        proposer, endorser, approver
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Success", data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
