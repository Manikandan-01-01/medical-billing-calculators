/*!
 * Medical Billing 101 – Appeal Letter Generator: data (codes, arguments, enclosures).
 * Educational template content written by Manikandan J, CPC, CRCR.
 * X12 CARC descriptions quoted from the X12 CARC list (usage notes omitted).
 * Load before appeal-generator.js. No personal data here.
 */
window.MBX_ALG_DATA = (function () {
	'use strict';
	var G = 'https://medicalbilling101.com/denial-codes/';
	// [code, X12 description, short label, category, guide slug ('' = no guide yet)]
	var codes = [
		['CO-4', 'The procedure code is inconsistent with the modifier used.', 'Modifier inconsistent with procedure', 'bund', 'co-4/'],
		['CO-5', 'The procedure code/type of bill is inconsistent with the place of service.', 'Inconsistent with place of service', 'missing', ''],
		['CO-11', 'The diagnosis is inconsistent with the procedure.', 'Diagnosis inconsistent with procedure', 'mednec', ''],
		['CO-15', 'The authorization number is missing, invalid, or does not apply to the billed services or provider.', 'Authorization number missing/invalid', 'auth', ''],
		['CO-16', 'Claim/service lacks information or has submission/billing error(s).', 'Missing information / billing error', 'missing', 'co-16/'],
		['OA-18', 'Exact duplicate claim/service.', 'Exact duplicate claim/service', 'dup', 'oa-18/'],
		['CO-19', 'This is a work-related injury/illness and thus the liability of the Worker\u2019s Compensation Carrier.', 'Work-related (workers\u2019 comp liable)', 'cob', ''],
		['CO-22', 'This care may be covered by another payer per coordination of benefits.', 'Another payer may be primary (COB)', 'cob', 'co-22/'],
		['OA-23', 'The impact of prior payer(s) adjudication including payments and/or adjustments.', 'Prior payer adjudication (COB)', 'cob', 'oa-23/'],
		['CO-24', 'Charges are covered under a capitation agreement/managed care plan.', 'Covered under capitation / managed care', 'elig', 'co-24/'],
		['CO-26', 'Expenses incurred prior to coverage.', 'Service before coverage started', 'elig', 'co-26/'],
		['CO-27', 'Expenses incurred after coverage terminated.', 'Service after coverage ended', 'elig', 'co-27/'],
		['CO-29', 'The time limit for filing has expired.', 'Timely filing limit expired', 'tf', 'co-29/'],
		['CO-31', 'Patient cannot be identified as our insured.', 'Patient not identified as insured', 'elig', 'co-31/'],
		['CO-39', 'Services denied at the time authorization/pre-certification was requested.', 'Authorization requested and denied', 'auth', 'co-39/'],
		['CO-45', 'Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.', 'Charge exceeds fee schedule / allowed', 'pay', 'co-45/'],
		['PR-49', 'This is a non-covered service because it is a routine/preventive exam or a diagnostic/screening procedure done in conjunction with a routine/preventive exam.', 'Routine / preventive exam not covered', 'noncov', 'pr-49/'],
		['CO-50', 'These are non-covered services because this is not deemed a \u2018medical necessity\u2019 by the payer.', 'Not medically necessary', 'mednec', 'co-50/'],
		['CO-55', 'Procedure/treatment/drug is deemed experimental/investigational by the payer.', 'Experimental / investigational', 'mednec', ''],
		['CO-59', 'Processed based on multiple or concurrent procedure rules. (For example multiple surgery or diagnostic imaging, concurrent anesthesia.)', 'Multiple / concurrent procedure rules', 'pay', 'co-59/'],
		['CO-60', 'Charges for outpatient services are not covered when performed within a period of time prior to or after inpatient services.', 'Outpatient service in inpatient window', 'other', 'co-60/'],
		['CO-70', 'Cost outlier \u2013 Adjustment to compensate for additional costs.', 'Cost outlier adjustment', 'pay', 'co-70/'],
		['CO-96', 'Non-covered charge(s).', 'Non-covered charge(s)', 'noncov', 'co-96/'],
		['CO-97', 'The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.', 'Included in another service (bundled)', 'bund', 'co-97/'],
		['CO-107', 'The related or qualifying claim/service was not identified on this claim.', 'Related / qualifying claim not identified', 'bund', ''],
		['CO-109', 'Claim/service not covered by this payer/contractor. You must send the claim/service to the correct payer/contractor.', 'Not covered by this payer / contractor', 'elig', 'co-109/'],
		['PR-119', 'Benefit maximum for this time period or occurrence has been reached.', 'Benefit maximum reached', 'noncov', 'pr-119/'],
		['CO-140', 'Patient/Insured health identification number and name do not match.', 'Member ID and name do not match', 'elig', ''],
		['CO-146', 'Diagnosis was invalid for the date(s) of service reported.', 'Diagnosis invalid for date of service', 'missing', ''],
		['CO-151', 'Payment adjusted because the payer deems the information submitted does not support this many/frequency of services.', 'Frequency / units not supported', 'mednec', 'co-151/'],
		['CO-167', 'This (these) diagnosis(es) is (are) not covered.', 'Diagnosis not covered', 'mednec', ''],
		['CO-181', 'Procedure code was invalid on the date of service.', 'Procedure code invalid on DOS', 'missing', ''],
		['CO-182', 'Procedure modifier was invalid on the date of service.', 'Modifier invalid on DOS', 'missing', ''],
		['CO-185', 'The rendering provider is not eligible to perform the service billed.', 'Rendering provider not eligible', 'prov', ''],
		['CO-197', 'Precertification/authorization/notification/pre-treatment absent.', 'Prior authorization absent', 'auth', 'co-197/'],
		['CO-198', 'Precertification/notification/authorization/pre-treatment exceeded.', 'Authorization exceeded', 'auth', ''],
		['PR-204', 'This service/equipment/drug is not covered under the patient\u2019s current benefit plan.', 'Not covered under patient\u2019s plan', 'noncov', 'pr-204/'],
		['CO-226', 'Information requested from the Billing/Rendering Provider was not provided or not provided timely or was insufficient/incomplete.', 'Requested provider info not received', 'missing', ''],
		['PR-227', 'Information requested from the patient/insured/responsible party was not provided or was insufficient/incomplete.', 'Requested patient info not received', 'missing', 'pr-227/'],
		['CO-234', 'This procedure is not paid separately.', 'Procedure not paid separately', 'bund', 'co-234/'],
		['CO-236', 'This procedure or procedure/modifier combination is not compatible with another procedure or procedure/modifier combination provided on the same day according to the National Correct Coding Initiative or workers compensation state regulations/ fee schedule requirements.', 'NCCI procedure pair not compatible', 'bund', 'co-236/'],
		['PR-242', 'Services not provided by network/primary care providers.', 'Not provided by network / PCP', 'prov', 'pr-242/'],
		['CO-252', 'An attachment/other documentation is required to adjudicate this claim/service.', 'Attachment / documentation required', 'missing', 'co-252/'],
		['CO-253', 'Sequestration \u2013 reduction in federal payment.', 'Sequestration reduction', 'pay', 'co-253/'],
		['CO-307', 'Medicare Maximum Fair Price Standard Default Refund Amount Adjustment.', 'Medicare MFP refund adjustment', 'pay', 'co-307/'],
		['PR-1', 'Deductible Amount.', 'Deductible', 'pay', 'pr-1-pr-2-pr-3/'],
		['PR-2', 'Coinsurance Amount.', 'Coinsurance', 'pay', 'pr-1-pr-2-pr-3/'],
		['PR-3', 'Co-payment Amount.', 'Copay', 'pay', 'pr-1-pr-2-pr-3/'],
		['CO-A1', 'Claim/Service denied.', 'Claim/service denied (general)', 'other', 'co-a1/'],
		['CO-B7', 'This provider was not certified/eligible to be paid for this procedure/service on this date of service.', 'Provider not certified / eligible on DOS', 'prov', 'co-b7/'],
		['CO-B9', 'Patient is enrolled in a Hospice.', 'Patient enrolled in hospice', 'elig', 'co-b9/'],
		['CO-B15', 'This service/procedure requires that a qualifying service/procedure be received and covered. The qualifying other service/procedure has not been received/adjudicated.', 'Qualifying service not received', 'bund', 'co-b15/']
	].map(function (r) {
		return { code: r[0], num: r[0].split('-')[1], group: r[0].split('-')[0], desc: r[1], label: r[2], cat: r[3], url: r[4] ? G + r[4] : '' };
	});
	// CO-97 has its main guide at a different URL.
	codes.forEach(function (c) { if (c.code === 'CO-97') { c.url = 'https://medicalbilling101.com/co-97-denial-code/'; } });

	var enclosures = {
		eob: 'Copy of the EOB/remittance advice showing the denial',
		claim: 'Copy of the original claim',
		corrected: 'Corrected claim',
		records: 'Medical records / visit notes for the date(s) of service',
		opnote: 'Operative or procedure report',
		lmn: 'Letter of medical necessity from the treating provider',
		auth: 'Prior authorization approval',
		tfproof: 'Proof of timely filing (clearinghouse acceptance report or payer acknowledgment)',
		elig: 'Eligibility and benefits verification',
		idcard: 'Copy of the member ID card',
		priEob: 'Primary payer EOB',
		referral: 'Referral',
		enroll: 'Provider enrollment / credentialing confirmation',
		policy: 'Relevant payer policy, coverage determination or NCCI edit excerpt',
		contract: 'Fee schedule / contract excerpt',
		prior: 'Prior appeal decision letter',
		aor: 'Signed appointment of representative or patient authorization (if required)'
	};

	// Arguments: id, checkbox label, paragraph ({tokens} are filled from the form), enclosures, extra fields to show.
	function A(id, label, text, enc, need) { return { id: id, label: label, text: text, enc: enc || [], need: need || [] }; }
	var cats = {
		mednec: { label: 'Medical necessity / diagnosis', args: [
			A('mn_docs', 'Records support medical necessity', 'The service was medically necessary. The enclosed medical records document the patient\u2019s presenting symptoms, relevant history, examination findings and the treating provider\u2019s clinical rationale for {cpt}. The diagnosis code(s) reported, {icd}, are supported by that documentation.', ['records']),
			A('mn_policy', 'Meets the payer\u2019s medical policy / coverage criteria', 'The service meets the coverage criteria in the applicable medical policy or coverage determination. A copy of the policy is enclosed, and the clinical findings that satisfy each criterion are identified in the enclosed records.', ['policy', 'records']),
			A('mn_lmn', 'Letter of medical necessity enclosed', 'A letter of medical necessity from the treating provider is enclosed. It explains why this service was required for the patient\u2019s condition and how it affected the plan of care.', ['lmn']),
			A('mn_conservative', 'Conservative treatment tried first', 'Less intensive treatment options were tried before this service and did not resolve the patient\u2019s condition, as documented in the enclosed records.', ['records']),
			A('mn_dx', 'Diagnosis supports the procedure', 'The diagnosis code(s) reported, {icd}, are consistent with {cpt} and are documented in the enclosed record as the reason the service was performed.', ['records']),
			A('mn_corrected', 'Corrected diagnosis coding enclosed', 'A corrected claim is enclosed with the diagnosis code(s) updated to reflect the condition documented in the medical record.', ['corrected', 'records']),
			A('mn_units', 'Units / frequency supported', 'The number of services or units billed is supported by the documentation. The enclosed records show each service performed, with the time or quantity documented for each unit billed.', ['records']),
			A('mn_invest', 'Not experimental / investigational', 'The service is not experimental or investigational for this indication. It is an accepted treatment for the patient\u2019s condition, as supported by the enclosed clinical documentation.', ['records', 'lmn'])
		] },
		tf: { label: 'Timely filing', args: [
			A('tf_proof', 'Proof the claim was filed on time', 'The claim was originally submitted within the timely filing limit. The enclosed clearinghouse acceptance report or payer acknowledgment shows that the claim was received on {orig_date}, which is within the filing limit for the date of service.', ['tfproof'], ['orig_date']),
			A('tf_resub', 'Resubmission of a timely original claim', 'This claim is a resubmission of original claim {orig_claim}, which was filed on time on {orig_date}. Because the original claim was timely, we ask that the timely filing denial be reversed.', ['tfproof'], ['orig_claim', 'orig_date']),
			A('tf_cob', 'Delay caused by primary payer processing', 'The delay resulted from coordination of benefits. The claim was first submitted to {other_payer}, which issued its determination on {pri_date}. We submitted the claim to your plan promptly after receiving that determination, and the primary payer\u2019s EOB is enclosed.', ['priEob'], ['other_payer', 'pri_date']),
			A('tf_info', 'Coverage was not known at the time of service', 'At the time of service, the patient did not provide coverage information for your plan. We billed your plan promptly after the coverage was identified, as shown in the enclosed documentation.', ['elig'])
		] },
		dup: { label: 'Duplicate', args: [
			A('dup_distinct', 'Not a duplicate: separate, distinct service', 'This claim is not a duplicate. The service(s) billed were separate and distinct from the service(s) on the previously processed claim, as documented in the enclosed records, and modifier {mod} was reported to identify the repeat or distinct service.', ['records'], ['mod']),
			A('dup_replace', 'Replacement (corrected) claim, frequency code 7', 'This claim was submitted as a replacement (corrected) claim for original claim {orig_claim}, using claim frequency code 7, not as a new claim. Please process it as a replacement of the original claim.', ['corrected'], ['orig_claim']),
			A('dup_unpaid', 'Original claim was never paid', 'The original claim, {orig_claim}, was not paid. Because no payment has been issued for these services, this claim should not have been denied as a duplicate. Please review the claim history and process the claim.', [], ['orig_claim'])
		] },
		bund: { label: 'Bundling / modifier / NCCI', args: [
			A('b_distinct', 'Separate and distinct service (modifier)', '{cpt} was a separate and distinct service from {paid_cpt}, not a component of it. The enclosed documentation shows the distinct circumstances (separate session, anatomic site or encounter), and modifier {mod} was appended to report them.', ['records'], ['paid_cpt', 'mod']),
			A('b_25', 'Significant, separately identifiable E/M (modifier 25)', 'The evaluation and management service, {cpt}, was significant and separately identifiable from {paid_cpt}, the procedure performed on the same day. Modifier 25 was appended to the E/M service, and the enclosed note documents the work performed beyond the usual pre- and post-procedure care.', ['records'], ['paid_cpt']),
			A('b_ncci', 'NCCI modifier indicator 1 (check the edit first)', 'Under the National Correct Coding Initiative (NCCI) procedure-to-procedure edits, the code pair {cpt} and {paid_cpt} has a modifier indicator of 1, which allows separate payment when an appropriate modifier is reported and the documentation supports it. The relevant edit is enclosed.', ['policy'], ['paid_cpt']),
			A('b_mod_valid', 'Modifier is valid for the procedure', 'The modifier reported, {mod}, is valid for {cpt} and accurately describes the service performed, as documented in the enclosed record.', ['records'], ['mod']),
			A('b_corrected', 'Corrected claim with updated modifier(s)', 'A corrected claim is enclosed with the modifier(s) updated to accurately report the service performed.', ['corrected']),
			A('b_qual', 'Qualifying service was billed', 'The qualifying service required for {cpt} was performed and billed as {paid_cpt} on claim {orig_claim}. Please process {cpt} together with that service.', [], ['paid_cpt', 'orig_claim'])
		] },
		elig: { label: 'Eligibility / coverage', args: [
			A('e_active', 'Coverage was active on the date of service', 'The patient had active coverage with your plan on the date of service. The enclosed eligibility verification shows the coverage effective dates.', ['elig']),
			A('e_id', 'Member ID and name match the ID card', 'The patient\u2019s name, date of birth and member ID on the claim match the member ID card, a copy of which is enclosed. Please reprocess the claim under member ID {member_id}.', ['idcard']),
			A('e_retro', 'Coverage updated / reinstated retroactively', 'The patient\u2019s coverage was updated or reinstated retroactively to include the date of service. Updated eligibility information is enclosed.', ['elig']),
			A('e_payer', 'Your plan is the correct payer', 'Your plan is the correct payer for this service. The enclosed eligibility verification shows the patient was enrolled with your plan on the date of service.', ['elig']),
			A('e_cap', 'Service is outside the capitation arrangement', 'The service billed is not included in the capitation arrangement for this patient and is payable separately, as shown in the enclosed agreement excerpt.', ['contract']),
			A('e_hospice', 'Unrelated to the hospice terminal condition (GW)', 'The service was not related to the patient\u2019s terminal condition under the hospice election. It was billed with modifier GW to indicate this, and the enclosed record documents the unrelated condition treated.', ['records'])
		] },
		auth: { label: 'Prior authorization', args: [
			A('a_obtained', 'Authorization was obtained', 'Authorization was obtained before the service was performed. Authorization number {auth_no} covers the service, provider and date(s) of service billed. A copy of the approval is enclosed.', ['auth'], ['auth_no']),
			A('a_units', 'Within the approved units / dates', 'The service(s) billed fall within the units, visits and dates approved under authorization {auth_no}. A copy of the approval is enclosed.', ['auth'], ['auth_no']),
			A('a_not_req', 'Authorization was not required', 'Prior authorization was not required for this service under the plan\u2019s requirements in effect on the date of service. The relevant prior authorization list or policy excerpt is enclosed.', ['policy']),
			A('a_urgent', 'Urgent / emergent service', 'The service was provided on an urgent basis, and delaying it to obtain authorization would have put the patient\u2019s health at risk. The enclosed records document the clinical urgency, and we request review of the service for medical necessity.', ['records']),
			A('a_denied', 'Auth denied, but criteria were met', 'Although the authorization request was denied, the enclosed clinical documentation shows that the service met the criteria for medical necessity. We ask that the service be reviewed on its clinical merits.', ['records', 'lmn'])
		] },
		cob: { label: 'Coordination of benefits', args: [
			A('c_primary', 'Your plan is primary', 'Your plan is the primary payer for this patient on the date of service. The enclosed coordination of benefits information confirms the order of benefits.', ['elig']),
			A('c_other_ended', 'Other coverage was not active', 'The patient\u2019s other coverage was not active on the date of service, as shown in the enclosed documentation. Your plan is therefore the primary payer.', ['elig']),
			A('c_secondary', 'Primary EOB enclosed; process as secondary', 'The primary payer, {other_payer}, processed this claim on {pri_date}. Its EOB is enclosed. Please process the claim as the secondary payer.', ['priEob'], ['other_payer', 'pri_date']),
			A('c_updated', 'Patient updated COB information', 'The patient has updated their coordination of benefits information with your plan. Please reprocess the claim using the updated information.', []),
			A('c_notwc', 'Not work-related', 'The service was not related to a work injury or illness, as documented in the enclosed records. Please process the claim under the patient\u2019s health plan benefits.', ['records'])
		] },
		missing: { label: 'Missing / invalid information', args: [
			A('m_attached', 'Requested information enclosed', 'The information or documentation requested is enclosed. Please reprocess the claim with this information.', ['records']),
			A('m_corrected', 'Corrected claim enclosed', 'A corrected claim is enclosed with the missing or invalid information updated.', ['corrected']),
			A('m_onfile', 'Information was on the original claim', 'The information was included on the original claim, as shown in the enclosed claim copy, so the claim was denied in error.', ['claim']),
			A('m_patient', 'Patient has provided the requested information', 'The patient has provided the information your plan requested, and a copy is enclosed. Please reprocess the claim.', [])
		] },
		pay: { label: 'Payment amount / underpayment', args: [
			A('p_contract', 'Allowed amount below the contracted rate', 'The allowed amount does not match the contracted rate for {cpt} under our provider agreement in effect on the date of service. The relevant fee schedule excerpt is enclosed. Please reprocess the claim at the contracted rate.', ['contract']),
			A('p_mppr', 'Multiple-procedure reduction applied incorrectly', 'The multiple procedure reduction was not applied correctly. Full payment should apply to the highest-valued procedure, with the reduction applied to the subsequent procedure(s); {cpt} was reduced in error.', []),
			A('p_cost', 'Patient cost share calculated incorrectly', 'The patient cost share (deductible, coinsurance or copay) was calculated incorrectly for this claim. Based on the patient\u2019s benefits on the date of service, the amount applied should be reviewed and corrected.', ['elig'])
		] },
		noncov: { label: 'Non-covered / benefit limit', args: [
			A('n_benefit', 'Service is a covered benefit', 'The service is a covered benefit under the member\u2019s plan. The enclosed benefits verification confirms coverage for this service on the date of service.', ['elig']),
			A('n_diag', 'Diagnostic, not routine / preventive', 'The service was diagnostic, not routine or preventive. It was performed to evaluate the symptoms and findings documented in the enclosed record.', ['records']),
			A('n_max', 'Benefit limit had not been reached', 'The benefit limit was applied in error. Based on the patient\u2019s claims history and plan benefits, the limit had not been reached on the date of service.', []),
			A('n_mednec', 'Medically necessary for this patient', 'The service was medically necessary for the patient\u2019s condition, as documented in the enclosed medical records.', ['records'])
		] },
		prov: { label: 'Provider enrollment / network', args: [
			A('pr_enrolled', 'Provider was enrolled / credentialed', 'The rendering provider (NPI {npi}) was enrolled and credentialed with your plan on the date of service. Enrollment confirmation is enclosed.', ['enroll']),
			A('pr_referral', 'Referral / network authorization in place', 'A referral or network authorization was in place for this service, as shown in the enclosed referral.', ['referral']),
			A('pr_corrected', 'Corrected rendering provider information', 'A corrected claim is enclosed with the rendering provider information updated.', ['corrected'])
		] },
		other: { label: 'General / other', args: [
			A('g_error', 'Processed in error; documentation supports payment', 'We believe this claim was processed in error. The enclosed documentation supports payment of {cpt} as billed.', ['records']),
			A('g_dates', 'Dates of service are outside the cited period', 'The dates of service on the claim are correct, as documented in the enclosed records, and fall outside the period cited in the denial.', ['records'])
		] }
	};

	var plans = [
		['commercial', 'Commercial'], ['ma', 'Medicare Advantage'], ['medicare', 'Original Medicare (Part A/B)'],
		['medicaid', 'Medicaid'], ['mmc', 'Medicaid managed care'], ['wc', 'Workers\u2019 compensation'], ['tricare', 'TRICARE'], ['other', 'Other']
	];
	var payers = ['Medicare Administrative Contractor (MAC)', 'State Medicaid program', 'UnitedHealthcare', 'Aetna', 'Cigna', 'Blue Cross Blue Shield', 'Humana', 'Anthem', 'Kaiser Permanente', 'Molina Healthcare', 'Centene / Ambetter', 'Sample Commercial Payer'];

	return { codes: codes, enclosures: enclosures, cats: cats, plans: plans, payers: payers };
})();
