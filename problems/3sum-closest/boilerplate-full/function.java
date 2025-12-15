//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int numsSize = sc.nextInt();
        List<Integer> nums = new ArrayList<>();
        for (int i = 0; i < numsSize; i++) nums.add(sc.nextInt());
        int target = sc.nextInt();
        Solution sol = new Solution();
        int result = sol.threeSumClosest(nums, target);
        System.out.println(result);
    }
}