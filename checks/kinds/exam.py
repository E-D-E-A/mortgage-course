"""Independent check of the exam's points (unit 9.5; src/data/exam-9-5.ts). Fact kind: exam_points.

Plain Python; nothing is imported from src/. The exam is worth one point for every closed question (graded by code) and one point for
every rubric line of an open question (ticked by the learner after reading the model answer). The exam has no pass mark: it shows points only.

  inputs   closed        the number of closed questions
           rubric        the rubric lines of each open question, "4|4|4|4"
           measure       "closed" | "open_questions" | "open_lines" | "total"
"""


def exam_points(i, _facts=None):
    closed = int(i["closed"])
    lines = [int(x) for x in str(i["rubric"]).split("|") if x != ""]
    total = closed + sum(lines)
    measure = i["measure"]
    if measure == "closed":
        return closed
    if measure == "open_questions":
        return len(lines)
    if measure == "open_lines":
        return sum(lines)
    if measure == "total":
        return total
    raise ValueError(measure)


KINDS = {"exam_points": exam_points}
