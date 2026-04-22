# ============================================================
# CogniClause — Production-Grade Clause Knowledge Base
# ============================================================
# Categories   : 15 (up from 7)
# Prototypes   : 100+ sentences across all categories
# Fine-grained : 45 risk labels (up from 17)
# Issues       : Specific, actionable per-category
# Suggestions  : Legal best-practice recommendations
# ============================================================

CATEGORIES = [
    "Intellectual Property",
    "Liability & Indemnification",
    "Payment & Invoicing",
    "Termination & Expiry",
    "Confidentiality & Non-Disclosure",
    "Governing Law & Dispute Resolution",
    "Force Majeure",
    "Representations & Warranties",
    "Data Protection & Privacy",
    "Non-Compete & Non-Solicitation",
    "Delivery & Performance",
    "Amendment & Waiver",
    "Assignment & Subcontracting",
    "Audit & Compliance",
    "General / Miscellaneous",
]

# ------------------------------------------------------------------
# CATEGORY PROTOTYPES
# Used by SentenceTransformer for cosine-similarity classification.
# More prototypes per category = better embedding coverage.
# ------------------------------------------------------------------
CATEGORY_PROTOTYPES = {

    "Intellectual Property": [
        "All intellectual property created under this agreement shall vest in the client upon payment.",
        "The vendor retains ownership of all pre-existing IP and background technology.",
        "A non-exclusive license is granted to use the deliverables for internal purposes only.",
        "New inventions, software, and works of authorship shall be considered work-for-hire.",
        "Ownership of all source code and derivatives shall transfer to the client on completion.",
        "The licensor grants the licensee a perpetual, royalty-free license to use the software.",
        "The contractor must not incorporate open-source software without prior written approval.",
        "All trademarks, patents, and copyrights remain the exclusive property of the company.",
        "Third-party IP used in deliverables requires written clearance from the rights holder.",
        "Upon termination, all licenses granted hereunder shall immediately cease.",
        "The client may not sub-license, resell, or transfer the IP without written consent.",
        "Moral rights in the work are hereby waived to the fullest extent permitted by law.",
    ],

    "Liability & Indemnification": [
        "The supplier shall not be liable for indirect, incidental, or consequential damages.",
        "Total liability shall not exceed the fees paid in the three months preceding the claim.",
        "Each party shall indemnify the other against third-party claims arising from its breach.",
        "The company is not responsible for loss of profits, data, or business opportunity.",
        "Indemnification obligations shall survive termination of this agreement.",
        "The indemnifying party shall defend, hold harmless, and indemnify the other party.",
        "Neither party excludes liability for death or personal injury caused by negligence.",
        "Consequential loss is excluded whether or not the party was advised of its possibility.",
        "Liability for wilful misconduct or fraud cannot be limited or excluded.",
        "The client assumes all risk associated with the use of the software in production.",
        "Aggregate liability under this agreement shall be capped at the annual contract value.",
        "In no event shall either party be liable for punitive or exemplary damages.",
        "The contractor indemnifies the client against all IP infringement claims by third parties.",
    ],

    "Payment & Invoicing": [
        "The client shall pay all invoices within 30 days of the invoice date.",
        "Late payments shall accrue interest at 1.5% per month on the outstanding balance.",
        "All fees are exclusive of applicable taxes, which shall be borne by the client.",
        "Payment shall be made in full without set-off, deduction, or withholding.",
        "An advance payment of 50% of the total fee is due upon signing this agreement.",
        "Invoices not disputed within 14 days shall be deemed accepted and payable.",
        "The service fee shall be revised annually in line with the CPI inflation index.",
        "The client may withhold payment if deliverables fail to meet agreed acceptance criteria.",
        "Milestone payments shall be released upon written sign-off of each project phase.",
        "All payments shall be made by bank transfer to the account details provided.",
        "Currency of payment shall be USD unless otherwise agreed in writing.",
        "In the event of dispute, undisputed portions of an invoice remain due and payable.",
        "Recurring subscription fees are billed monthly in advance and are non-refundable.",
    ],

    "Termination & Expiry": [
        "Either party may terminate this agreement on 30 days written notice.",
        "This agreement may be terminated immediately upon a material breach by either party.",
        "Termination for convenience requires 60 days prior written notice.",
        "Upon termination, all outstanding fees become immediately due and payable.",
        "Clauses relating to confidentiality, IP, and indemnity survive termination.",
        "The company may terminate for cause if the contractor becomes insolvent.",
        "Either party may terminate if the other enters administration or liquidation.",
        "Termination shall not relieve either party of obligations accrued before the effective date.",
        "The agreement shall automatically renew for successive one-year terms unless notice is given.",
        "The client may terminate if the vendor fails to cure a breach within 30 days of notice.",
        "Post-termination, the contractor must return or destroy all confidential materials.",
        "A party may suspend performance upon the other's failure to pay undisputed amounts.",
    ],

    "Confidentiality & Non-Disclosure": [
        "Each party shall keep the other's confidential information strictly confidential.",
        "Confidential information shall not be disclosed to any third party without prior consent.",
        "This obligation of confidentiality survives termination by five years.",
        "Confidential information excludes information already in the public domain.",
        "The receiving party may only use confidential information for the purposes of this agreement.",
        "Disclosure is permitted if required by court order or applicable law.",
        "The parties shall ensure their employees and agents are bound by equivalent confidentiality.",
        "Information shared under this agreement is provided on a need-to-know basis only.",
        "The receiving party shall promptly notify the disclosing party of any unauthorised disclosure.",
        "No license or right is granted over confidential information other than as expressly stated.",
        "The duty of confidentiality applies to technical, financial, and commercial information.",
        "Oral disclosures are covered if confirmed in writing within five business days.",
    ],

    "Governing Law & Dispute Resolution": [
        "This agreement shall be governed by and construed in accordance with the laws of India.",
        "Disputes shall be resolved by binding arbitration under the ICC Rules.",
        "The courts of Delhi shall have exclusive jurisdiction over any disputes.",
        "The parties shall first attempt to resolve disputes through good faith negotiation.",
        "If negotiation fails, disputes shall be referred to mediation before arbitration.",
        "Any arbitration award shall be final and binding on the parties.",
        "The seat of arbitration shall be Singapore and proceedings shall be in English.",
        "Each party irrevocably submits to the jurisdiction of the courts specified herein.",
        "Notwithstanding this clause, either party may seek urgent injunctive relief from any court.",
        "The prevailing party in any dispute shall be entitled to recover reasonable legal fees.",
        "This agreement shall be interpreted in accordance with the United Nations CISG.",
        "Choice of law does not affect mandatory consumer protection laws of the buyer's jurisdiction.",
    ],

    "Force Majeure": [
        "Neither party shall be liable for delays caused by events beyond their reasonable control.",
        "Force majeure events include natural disasters, war, pandemics, and government actions.",
        "The affected party must notify the other within 48 hours of a force majeure event.",
        "If force majeure persists for more than 90 days, either party may terminate.",
        "Force majeure shall not excuse non-payment of fees already due.",
        "The affected party shall use reasonable efforts to mitigate the impact of the event.",
        "Strikes and industrial disputes shall constitute force majeure if unforeseeable.",
        "Cyberattacks and infrastructure outages may qualify as force majeure events.",
        "The suspension of obligations is limited to the duration of the force majeure event.",
        "Force majeure does not apply to circumstances that were foreseeable at signing.",
    ],

    "Representations & Warranties": [
        "Each party represents that it has the authority to enter into this agreement.",
        "The vendor warrants that the software will perform materially as documented for 90 days.",
        "The company represents that it is not subject to any litigation that affects performance.",
        "The contractor warrants that deliverables will be free from material defects.",
        "Each party warrants that it will comply with all applicable laws and regulations.",
        "The service provider represents that it holds all necessary licences and permissions.",
        "The client warrants that all data provided for processing has been lawfully obtained.",
        "Warranties are limited to direct replacement or re-performance at the vendor's discretion.",
        "All implied warranties of merchantability and fitness for purpose are hereby disclaimed.",
        "The vendor makes no warranty that the software will be error-free or uninterrupted.",
        "Representations made herein shall be deemed repeated on each date of performance.",
        "False representations shall entitle the other party to terminate without liability.",
    ],

    "Data Protection & Privacy": [
        "The processor shall process personal data only on documented instructions of the controller.",
        "Each party shall comply with all applicable data protection laws including GDPR and DPDPA.",
        "Personal data shall not be transferred outside the EEA without adequate safeguards.",
        "The processor shall implement appropriate technical and organisational security measures.",
        "Data subjects' rights including access, erasure, and portability shall be honoured.",
        "Data breaches must be reported to the controller within 72 hours of discovery.",
        "Personal data shall be retained only as long as necessary for the stated purposes.",
        "The processor shall not sub-process personal data without prior written consent.",
        "On termination, all personal data shall be deleted or returned at the controller's election.",
        "The parties shall conduct a Data Protection Impact Assessment before high-risk processing.",
        "Anonymised or aggregated data derived from processing may be used for analytics.",
        "The controller retains ownership and responsibility for all personal data processed.",
    ],

    "Non-Compete & Non-Solicitation": [
        "During the term and for 12 months after, the contractor shall not compete with the company.",
        "The employee shall not solicit clients of the company for a period of 24 months post-termination.",
        "The non-compete clause is limited to the markets and geographies served by the company.",
        "The parties agree not to hire each other's employees during and for one year after the term.",
        "This restriction applies to direct competition only and not to incidental market overlap.",
        "The non-solicitation obligation does not apply to general advertising or recruitment drives.",
        "Consideration paid for this restriction is embedded in the fees payable under this agreement.",
        "If a court finds this clause unenforceable, it shall be read down to the minimum enforceable scope.",
        "No restriction applies if the other party terminates this agreement without cause.",
        "The geographic scope of the non-compete is limited to the territories listed in Schedule A.",
    ],

    "Delivery & Performance": [
        "The vendor shall deliver the project within 45 days of the project commencement date.",
        "Delivery timelines are estimates and not guaranteed unless stated as firm deadlines.",
        "Time is of the essence with respect to all delivery milestones in this agreement.",
        "The client shall provide timely feedback within 5 business days of each deliverable.",
        "Delay by the client in providing inputs shall extend delivery deadlines proportionally.",
        "The vendor shall provide weekly progress reports against agreed milestones.",
        "Acceptance testing shall be completed within 10 business days of delivery.",
        "Failure to meet a critical milestone entitles the client to liquidated damages.",
        "The vendor shall maintain adequate resources to meet the agreed delivery schedule.",
        "Title and risk in physical goods pass to the buyer upon delivery to the agreed location.",
        "Software shall be considered delivered when made available for download or deployment.",
        "Partial delivery shall not constitute fulfilment of the vendor's obligations.",
    ],

    "Amendment & Waiver": [
        "No amendment to this agreement is valid unless made in writing and signed by both parties.",
        "Waiver of a breach does not constitute waiver of any subsequent breach.",
        "No course of dealing shall modify the terms of this agreement.",
        "Changes to the scope of work require a signed change order from both parties.",
        "Any variation agreed verbally must be confirmed in writing within 5 business days.",
        "Failure to enforce any provision shall not be construed as a waiver of that right.",
        "Amendments may be made electronically provided they are clearly marked as amendments.",
        "The agreement may only be amended by written instrument signed by authorised representatives.",
    ],

    "Assignment & Subcontracting": [
        "Neither party may assign this agreement without the prior written consent of the other.",
        "The contractor may subcontract work but remains responsible for subcontractor performance.",
        "Assignment to an affiliate or successor entity in a merger shall not require consent.",
        "The vendor shall disclose all subcontractors before engagement.",
        "Any purported assignment in breach of this clause shall be void and of no effect.",
        "The assignee must agree in writing to be bound by the terms of this agreement.",
        "The client may assign this agreement as part of a sale of all or substantially all assets.",
        "Sub-contracting does not relieve the contractor of its primary obligations.",
    ],

    "Audit & Compliance": [
        "The client may audit the vendor's records upon 10 business days' prior written notice.",
        "The vendor shall maintain accurate records for a minimum of 7 years.",
        "All parties shall comply with applicable anti-bribery and anti-corruption laws.",
        "The vendor shall certify annually that it is in compliance with all regulatory requirements.",
        "Audit costs shall be borne by the auditing party unless material non-compliance is found.",
        "The vendor shall cooperate fully with any regulatory investigation related to this agreement.",
        "The client has the right to audit data security controls and penetration test results.",
        "The vendor shall provide evidence of insurance coverage upon request.",
        "Failure to maintain required licences shall constitute a material breach of this agreement.",
        "The vendor shall conduct background checks on all personnel accessing client systems.",
    ],

    "General / Miscellaneous": [
        "This agreement constitutes the entire understanding between the parties on this subject.",
        "If any provision is found unenforceable, the remaining terms shall continue in force.",
        "This agreement may be executed in counterparts, each of which shall be an original.",
        "Headings are for convenience only and shall not affect interpretation.",
        "Notices shall be in writing and delivered by email with read-receipt or courier.",
        "The relationship between the parties is that of independent contractors.",
        "This agreement does not create a partnership, joint venture, or agency relationship.",
        "Each party shall bear its own costs of negotiating and executing this agreement.",
        "Schedules and annexures form part of this agreement and are incorporated by reference.",
        "In the event of conflict, the main body of the agreement prevails over the schedules.",
        "Words importing the singular include the plural and vice versa.",
        "This agreement is binding on the successors and permitted assigns of both parties.",
    ],
}

# ------------------------------------------------------------------
# FINE-GRAINED RISK LABELS
# Used for sub-classification within a category.
# ------------------------------------------------------------------
FINE_GRAINED_LABELS = [
    # Intellectual Property
    "IP Ownership Ambiguity Risk",
    "Background IP Exposure Risk",
    "Open-Source License Contamination Risk",
    "IP License Scope Risk",
    "Work-for-Hire Classification Risk",
    "IP Transfer on Payment Risk",
    "Moral Rights Retention Risk",

    # Liability & Indemnification
    "Uncapped Liability Exposure Risk",
    "Indemnification Trigger Ambiguity Risk",
    "Consequential Loss Exclusion Risk",
    "Third-Party Claim Liability Risk",
    "Mutual Indemnity Imbalance Risk",
    "Wilful Misconduct Carve-Out Risk",
    "Indemnification Survival Risk",

    # Payment & Invoicing
    "Payment Default Risk",
    "Late Payment Interest Risk",
    "Tax Withholding Risk",
    "Invoice Dispute Mechanism Risk",
    "Milestone Payment Release Risk",
    "Currency Fluctuation Risk",
    "Advance Payment Exposure Risk",

    # Termination & Expiry
    "Termination for Convenience Risk",
    "Termination for Cause Trigger Risk",
    "Survival of Obligations Risk",
    "Auto-Renewal Lock-in Risk",
    "Post-Termination Data Retention Risk",

    # Confidentiality & NDA
    "Confidentiality Breach Risk",
    "Confidentiality Scope Ambiguity Risk",
    "Post-Termination Disclosure Risk",
    "Employee / Agent Confidentiality Risk",

    # Governing Law & Dispute
    "Jurisdiction Conflict Risk",
    "Arbitration Enforceability Risk",
    "Dispute Escalation Delay Risk",
    "Cross-Border Enforcement Risk",

    # Force Majeure
    "Force Majeure Scope Overreach Risk",
    "Force Majeure Notification Failure Risk",
    "Extended Force Majeure Termination Risk",

    # Representations & Warranties
    "Warranty Disclaimer Risk",
    "Misrepresentation Risk",
    "Implied Warranty Exclusion Risk",

    # Data Protection & Privacy
    "Personal Data Processing Risk",
    "Data Breach Notification Risk",
    "Cross-Border Data Transfer Risk",
    "Sub-Processor Control Risk",

    # Non-Compete & Non-Solicitation
    "Non-Compete Enforceability Risk",
    "Key Personnel Solicitation Risk",
    "Overly Broad Restriction Risk",

    # Delivery & Performance
    "Delivery Delay Risk",
    "Acceptance Testing Failure Risk",
    "Liquidated Damages Exposure Risk",
    "Milestone Miss Risk",
    "Performance SLA Breach Risk",

    # Amendment & Waiver
    "Unintended Waiver Risk",
    "Oral Amendment Enforceability Risk",

    # Assignment & Subcontracting
    "Unauthorised Assignment Risk",
    "Subcontractor Performance Risk",
    "Change of Control Exposure Risk",

    # Audit & Compliance
    "Regulatory Non-Compliance Risk",
    "Audit Access Refusal Risk",
    "Record Retention Failure Risk",
    "Anti-Bribery Violation Risk",

    # General
    "Entire Agreement Integration Risk",
    "Severability Failure Risk",
    "Counterpart Execution Risk",
]

# ------------------------------------------------------------------
# CATEGORY RISK MAP
# Default severity when a category is identified.
# Override with clause-level scoring for higher precision.
# ------------------------------------------------------------------
CATEGORY_RISK_MAP = {
    "Intellectual Property":              "High",
    "Liability & Indemnification":        "High",
    "Payment & Invoicing":                "High",
    "Termination & Expiry":               "Medium",
    "Confidentiality & Non-Disclosure":   "High",
    "Governing Law & Dispute Resolution": "Medium",
    "Force Majeure":                      "Medium",
    "Representations & Warranties":       "Medium",
    "Data Protection & Privacy":          "High",
    "Non-Compete & Non-Solicitation":     "Medium",
    "Delivery & Performance":             "Medium",
    "Amendment & Waiver":                 "Low",
    "Assignment & Subcontracting":        "Medium",
    "Audit & Compliance":                 "Medium",
    "General / Miscellaneous":            "Low",
}

# ------------------------------------------------------------------
# ISSUES
# Short, specific problem statement per category.
# Shown alongside a flagged clause on the UI.
# ------------------------------------------------------------------
ISSUES = {
    "Intellectual Property": (
        "IP ownership is not clearly allocated between the parties; "
        "deliverables may not legally transfer to the client."
    ),
    "Liability & Indemnification": (
        "Liability exposure is uncapped or indemnification triggers are vague, "
        "creating unpredictable financial risk."
    ),
    "Payment & Invoicing": (
        "Payment terms are ambiguous — missing clear due dates, "
        "dispute mechanisms, or late-payment consequences."
    ),
    "Termination & Expiry": (
        "Termination conditions are unclear or notice periods are absent, "
        "risking abrupt or contested contract endings."
    ),
    "Confidentiality & Non-Disclosure": (
        "Confidentiality obligations are too broad, too narrow, or lack "
        "a defined duration and exception carve-outs."
    ),
    "Governing Law & Dispute Resolution": (
        "Governing law or jurisdiction is not specified, "
        "leaving disputes subject to conflicting legal systems."
    ),
    "Force Majeure": (
        "Force majeure events are poorly defined or the notice obligation "
        "is absent, exposing a party to wrongful breach claims."
    ),
    "Representations & Warranties": (
        "Warranties are overly broad or critical implied warranties "
        "are disclaimed without appropriate carve-outs."
    ),
    "Data Protection & Privacy": (
        "Data processing obligations do not align with GDPR, DPDPA, or "
        "applicable privacy law — potential regulatory liability."
    ),
    "Non-Compete & Non-Solicitation": (
        "Restriction is overly broad in scope, duration, or geography "
        "and may not be enforceable in the relevant jurisdiction."
    ),
    "Delivery & Performance": (
        "Delivery obligations lack firm deadlines, acceptance criteria, "
        "or consequences for delay — reducing accountability."
    ),
    "Amendment & Waiver": (
        "Amendment process is informal or absent; verbal agreements "
        "may inadvertently modify binding obligations."
    ),
    "Assignment & Subcontracting": (
        "Assignment rights are unrestricted or subcontractor obligations "
        "are not adequately controlled."
    ),
    "Audit & Compliance": (
        "Audit rights are absent or too narrow; the party may lack "
        "visibility into compliance with regulatory and contractual obligations."
    ),
    "General / Miscellaneous": (
        "Clause lacks clarity or contains boilerplate language that may "
        "conflict with specific provisions elsewhere in the agreement."
    ),
}

# ------------------------------------------------------------------
# SUGGESTIONS
# Actionable legal best-practice recommendation per category.
# Displayed as the remediation advice on the UI.
# ------------------------------------------------------------------
SUGGESTIONS = {
    "Intellectual Property": (
        "Explicitly distinguish background IP (retained by the creator) from foreground IP "
        "(transferred to the client on full payment). Define license scope — exclusive vs. "
        "non-exclusive, field of use, territory, and sublicensing rights. Obtain written approval "
        "before incorporating any open-source components."
    ),
    "Liability & Indemnification": (
        "Cap aggregate liability at a defined multiple of the annual contract value (e.g., 1× or 2×). "
        "Exclude liability for indirect, consequential, and punitive damages. Carve out fraud, "
        "wilful misconduct, and IP indemnification from the cap. Ensure indemnification obligations "
        "are mutual and survive termination."
    ),
    "Payment & Invoicing": (
        "Specify invoice due date, accepted payment methods, and currency. Define late-payment "
        "interest rates (e.g., 1.5% per month). Include a formal invoice dispute process with "
        "a resolution timeline. Ensure milestone payments are tied to signed acceptance criteria "
        "and specify treatment of disputed vs. undisputed amounts."
    ),
    "Termination & Expiry": (
        "Define clear triggers for termination for cause (e.g., uncured material breach within 30 days) "
        "and termination for convenience (e.g., 60-day notice). List clauses that survive termination "
        "explicitly (IP, confidentiality, indemnity, payment). Include post-termination obligations "
        "for data return, handover, and outstanding invoices."
    ),
    "Confidentiality & Non-Disclosure": (
        "Define 'Confidential Information' precisely and list clear exclusions (public domain, "
        "prior knowledge, independent development). Set a fixed confidentiality period (e.g., "
        "5 years post-termination). Require employees and subcontractors to sign equivalent NDAs. "
        "Include a prompt-disclosure obligation for any unauthorised breach."
    ),
    "Governing Law & Dispute Resolution": (
        "Specify governing law and the exclusive jurisdiction of a named court or arbitral body. "
        "Include a multi-tiered dispute resolution clause: negotiation → mediation → arbitration. "
        "Specify arbitration rules (ICC, SIAC, LCIA), seat, language, and number of arbitrators. "
        "Reserve the right to seek interim injunctive relief from any competent court."
    ),
    "Force Majeure": (
        "Enumerate specific force majeure events and include a general catch-all for unforeseeable "
        "events beyond reasonable control. Require notification within 48 hours. Specify that the "
        "affected party must use commercially reasonable efforts to mitigate. Allow either party to "
        "terminate if the event persists beyond 60–90 days. Exclude payment obligations from the clause."
    ),
    "Representations & Warranties": (
        "Tailor warranties to the specific subject matter (software, services, goods). Include a "
        "remedy regime: repair, replacement, or refund within a defined warranty period. Limit "
        "disclaimer of implied warranties only where legally permissible. Ensure representations "
        "are repeated at each delivery date and require immediate notice of any breach."
    ),
    "Data Protection & Privacy": (
        "Include a Data Processing Agreement (DPA) compliant with GDPR Article 28 / DPDPA. "
        "List permitted processing purposes, data categories, and retention periods. Require "
        "72-hour breach notification. Restrict sub-processing and cross-border transfers. "
        "Include DSAR support obligations and annual security audit rights."
    ),
    "Non-Compete & Non-Solicitation": (
        "Limit the non-compete to a defined geographic scope and specific competing activities. "
        "Keep duration to 6–12 months post-termination to improve enforceability. Separate "
        "non-solicitation of clients from non-solicitation of employees. Confirm the restriction "
        "does not apply where the company terminates without cause."
    ),
    "Delivery & Performance": (
        "Define time-is-of-the-essence milestones with exact dates. Specify acceptance criteria "
        "and a formal acceptance testing period. Liquidated damages for delay should reflect a "
        "genuine pre-estimate of loss (e.g., 0.5% per week, capped at 10%). Require the vendor "
        "to provide progress reports and notify delays promptly with a revised plan."
    ),
    "Amendment & Waiver": (
        "Require all amendments to be in writing and signed by duly authorised representatives. "
        "Include an explicit non-waiver clause. Prohibit oral modifications and require electronic "
        "amendments to be clearly marked. Maintain a version-controlled schedule of agreed changes."
    ),
    "Assignment & Subcontracting": (
        "Prohibit assignment without prior written consent, except to affiliates or successors in "
        "a merger. Require disclosure of all subcontractors and ensure the prime contractor remains "
        "liable for their performance. Include change-of-control provisions entitling the other party "
        "to terminate if ownership changes materially."
    ),
    "Audit & Compliance": (
        "Grant the client audit rights on reasonable notice (e.g., 10 business days) no more than "
        "once per year. Require the vendor to retain records for at least 7 years. Include mandatory "
        "compliance with anti-bribery, anti-money-laundering, and sanctions laws. Specify that "
        "audit costs are borne by the auditing party unless material non-compliance is found."
    ),
    "General / Miscellaneous": (
        "Ensure the entire agreement clause expressly supersedes all prior negotiations. "
        "Include a severability clause with a blue-pencil right for courts to modify rather than "
        "strike unenforceable provisions. Use clear notice provisions specifying method, address, "
        "and deemed-delivery timeline. Confirm the relationship is that of independent contractors."
    ),
}

# ------------------------------------------------------------------
# RISK KEYWORDS (optional — for rule-based boosting)
# If these keywords appear in a clause, raise the computed risk level.
# ------------------------------------------------------------------
RISK_BOOSTING_KEYWORDS = {
    "High": [
        "unlimited", "sole discretion", "waive all rights", "no warranty",
        "as-is", "irrevocable", "perpetual", "unconditional", "absolute",
        "indemnify against all claims", "personal data", "transfer of ownership",
    ],
    "Medium": [
        "reasonable", "material breach", "good faith", "best efforts",
        "may terminate", "subject to", "at cost", "industry standard",
        "commercially reasonable", "estimated", "subject to change",
    ],
    "Low": [
        "notice", "in writing", "acknowledge", "confirm", "agree",
        "understand", "counterpart", "schedule", "appendix",
    ],
}