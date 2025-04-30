from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

@app.route("/")
def index():
    numbers = random.choices(range(1, 10), k=4)
    return render_template("index.html", numbers=numbers)

@app.route("/check_solution", methods=["POST"])
def check_solution():
    data = request.get_json()
    numbers = data.get("numbers", [])

    def solve(nums):
        if len(nums) == 1:
            return abs(nums[0] - 24) < 1e-6
        for i in range(len(nums)):
            for j in range(len(nums)):
                if i != j:
                    rest = [nums[k] for k in range(len(nums)) if k != i and k != j]
                    for op in ['+', '-', '*', '/']:
                        if op == '+':
                            candidate = nums[i] + nums[j]
                        elif op == '-':
                            candidate = nums[i] - nums[j]
                        elif op == '*':
                            candidate = nums[i] * nums[j]
                        elif op == '/' and nums[j] != 0:
                            candidate = nums[i] / nums[j]
                        else:
                            continue
                        if solve(rest + [candidate]):
                            return True
        return False

    solution_exists = solve(numbers)
    return jsonify({"solution_exists": solution_exists})

if __name__ == "__main__":
    app.run(debug=True)