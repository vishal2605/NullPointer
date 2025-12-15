import java.util.*;

//USER_CODE_HERE

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int numsSize = sc.nextInt();
        int[] nums = new int[numsSize];
        for (int i = 0; i < numsSize; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}